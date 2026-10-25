alter table public.leads
  add column if not exists disclaimer_accepted_at timestamptz;

create table if not exists public.vip_passes (
  pass_id text primary key check (pass_id ~ '^ORZ-VIP-[0-9]{8}-[A-F0-9]{4}$'),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  buyer_user_id uuid not null references public.profiles(id) on delete cascade,
  buyer_name text not null,
  buyer_phone_masked text not null check (buyer_phone_masked ~ '^[*]+[0-9]{4}$'),
  property_id uuid not null references public.properties(id) on delete cascade,
  dealer_id uuid references public.profiles(id) on delete set null,
  visit_timestamp timestamptz not null,
  tagging_valid_until timestamptz not null,
  disclaimer_accepted_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.vip_passes enable row level security;
revoke all on public.vip_passes from anon;
grant select on public.vip_passes to authenticated;
create policy "Buyers read their own VIP passes" on public.vip_passes
  for select to authenticated using (buyer_user_id = (select auth.uid()));

create or replace function orenzaa_private.finalize_vip_pass() returns trigger
language plpgsql security definer set search_path = '' as $$
declare digits text;
begin
  if new.visit_date is null then return new; end if;
  if new.disclaimer_accepted_at is null then
    raise exception 'Buyer safety disclaimer acceptance is required';
  end if;
  digits := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
  new.vip_pass_id := 'ORZ-VIP-' || to_char(now() at time zone 'Asia/Kolkata', 'YYYYMMDD') || '-' || digits;
  return new;
end $$;
revoke all on function orenzaa_private.finalize_vip_pass() from public, anon, authenticated;
create trigger zz_finalize_vip_pass before insert on public.leads
  for each row execute function orenzaa_private.finalize_vip_pass();

create or replace function orenzaa_private.create_vip_pass() returns trigger
language plpgsql security definer set search_path = '' as $$
declare property_owner uuid;
begin
  if new.vip_pass_id is null then return new; end if;
  select coalesce(created_by, listed_by) into property_owner
    from public.properties where id = new.property_id;
  insert into public.vip_passes (
    pass_id, lead_id, buyer_user_id, buyer_name, buyer_phone_masked,
    property_id, dealer_id, visit_timestamp, tagging_valid_until, disclaimer_accepted_at
  ) values (
    new.vip_pass_id, new.id, new.user_id, new.name,
    repeat('*', greatest(length(regexp_replace(new.phone, '[^0-9]', '', 'g')) - 4, 0))
      || right(regexp_replace(new.phone, '[^0-9]', '', 'g'), 4),
    new.property_id, property_owner,
    (new.visit_date::timestamp at time zone 'Asia/Kolkata'),
    (new.visit_date::timestamp at time zone 'Asia/Kolkata') + interval '180 days',
    new.disclaimer_accepted_at
  );
  return new;
end $$;
revoke all on function orenzaa_private.create_vip_pass() from public, anon, authenticated;
create trigger create_vip_pass after insert on public.leads
  for each row execute function orenzaa_private.create_vip_pass();

comment on table public.vip_passes is 'Digital site visit passes; buyer phone numbers are stored masked only.';
