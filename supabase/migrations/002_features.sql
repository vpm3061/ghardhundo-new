-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/angokuzvthqzezdnpptf/sql

-- ─── Property enhancements ─────────────────────────────────────────────────
alter table public.properties
  add column if not exists is_featured boolean default false,
  add column if not exists listed_by uuid references auth.users(id) on delete set null;

-- ─── Lead enhancements ─────────────────────────────────────────────────────
alter table public.leads
  add column if not exists referrer_id uuid references auth.users(id) on delete set null,
  add column if not exists deal_amount numeric;

-- ─── Coins ─────────────────────────────────────────────────────────────────
create table if not exists public.coins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text check (type in ('earned','spent')),
  description text,
  created_at timestamptz default now()
);
alter table public.coins enable row level security;
create policy "Users view own coins" on public.coins for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own coins" on public.coins for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Admin manage coins" on public.coins for all to authenticated using ((select auth.email()) = 'tellitorg1@gmail.com');
grant select, insert on public.coins to authenticated;

-- ─── Referrals ─────────────────────────────────────────────────────────────
create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid references auth.users(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  earned_coins integer default 10,
  created_at timestamptz default now()
);
alter table public.referrals enable row level security;
create policy "Users view own referrals" on public.referrals for select to authenticated using ((select auth.uid()) = referrer_id);
create policy "System insert referrals" on public.referrals for insert to authenticated with check (true);
create policy "Admin manage referrals" on public.referrals for all to authenticated using ((select auth.email()) = 'tellitorg1@gmail.com');
grant select, insert on public.referrals to authenticated;

-- ─── Lead reveals (dealer feature) ─────────────────────────────────────────
create table if not exists public.lead_reveals (
  id uuid primary key default uuid_generate_v4(),
  dealer_id uuid references auth.users(id) on delete cascade not null,
  lead_id uuid references public.leads(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(dealer_id, lead_id)
);
alter table public.lead_reveals enable row level security;
create policy "Users manage own reveals" on public.lead_reveals for all to authenticated using ((select auth.uid()) = dealer_id);
grant all on public.lead_reveals to authenticated;

-- ─── Dealer: can read WARM/COLD leads ──────────────────────────────────────
create policy "Dealer read warm cold leads" on public.leads
  for select to authenticated
  using (tier in ('WARM','COLD'));

-- ─── Trigger: coins on property listing ────────────────────────────────────
create or replace function public.award_listing_coins()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.listed_by is not null then
    insert into public.coins (user_id, amount, type, description)
    values (new.listed_by, 50, 'earned', 'Property listed: ' || new.title);
  end if;
  return new;
end;
$$;
drop trigger if exists on_property_listed on public.properties;
create trigger on_property_listed
  after insert on public.properties
  for each row execute function public.award_listing_coins();

-- ─── Trigger: coins on referral lead ───────────────────────────────────────
create or replace function public.award_referral_coins()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.referrer_id is not null then
    insert into public.referrals (referrer_id, lead_id, property_id, earned_coins)
    values (new.referrer_id, new.id, new.property_id, 10);
    insert into public.coins (user_id, amount, type, description)
    values (new.referrer_id, 10, 'earned', 'Referral credit for lead: ' || new.name);
  end if;
  return new;
end;
$$;
drop trigger if exists on_lead_referral on public.leads;
create trigger on_lead_referral
  after insert on public.leads
  for each row execute function public.award_referral_coins();
