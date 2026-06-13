-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/angokuzvthqzezdnpptf/sql

create extension if not exists "uuid-ossp";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);

-- Properties
create table if not exists public.properties (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  builder text,
  sector text,
  city text,
  price_min numeric,
  price_max numeric,
  bhk text[],
  status text check (status in ('Under Construction','Ready to Move','New Launch')),
  rera_number text,
  description text,
  photos text[],
  amenities text[],
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.properties enable row level security;
create policy "Public read active properties" on public.properties for select using (is_active = true);
create policy "Admin all properties" on public.properties for all to authenticated using ((select auth.email()) = 'tellitorg1@gmail.com');

-- Leads
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  phone text not null,
  budget text,
  bhk text,
  timeline text,
  loan_status text,
  purpose text,
  city text,
  ai_score integer default 0,
  tier text check (tier in ('HOT','WARM','COLD')),
  status text default 'New' check (status in ('New','Called','Visit Fixed','Deal Done','Not Interested')),
  created_at timestamptz default now()
);
alter table public.leads enable row level security;
create policy "Authenticated insert leads" on public.leads for insert to authenticated with check (true);
create policy "Users view own leads" on public.leads for select to authenticated using ((select auth.uid()) = user_id);
create policy "Admin all leads" on public.leads for all to authenticated using ((select auth.email()) = 'tellitorg1@gmail.com');

-- Commissions
create table if not exists public.commissions (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete cascade,
  builder_name text,
  amount numeric,
  status text default 'Pending' check (status in ('Pending','Received','Partial')),
  created_at timestamptz default now()
);
alter table public.commissions enable row level security;
create policy "Admin all commissions" on public.commissions for all to authenticated using ((select auth.email()) = 'tellitorg1@gmail.com');

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grants
grant usage on schema public to anon, authenticated;
grant select on public.properties to anon;
grant all on public.profiles to authenticated;
grant all on public.properties to authenticated;
grant all on public.leads to authenticated;
grant all on public.commissions to authenticated;
