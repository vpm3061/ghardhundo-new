-- Four property pillars, sale/rent intent, media review, VIP cost snapshots,
-- qualified ticket data and verified CP commission settlement tracking.

alter table public.properties
  add column if not exists property_pillar text,
  add column if not exists listing_intent text,
  add column if not exists property_subtype text,
  add column if not exists land_area_unit text,
  add column if not exists stamp_duty_estimate numeric(14,2),
  add column if not exists legal_fees_estimate numeric(14,2),
  add column if not exists security_deposit_amount numeric(14,2),
  add column if not exists advance_terms text,
  add column if not exists lease_duration_months integer,
  add column if not exists media_review_status text default 'approved',
  add column if not exists media_reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists media_reviewed_at timestamptz;

update public.properties
set property_pillar = coalesce(property_pillar, case property_category
      when 'plot' then 'land' when 'commercial' then 'commercial' else 'residential' end),
    listing_intent = coalesce(listing_intent, case when property_category = 'rental' or monthly_rent is not null then 'rent' else 'sale' end),
    property_subtype = coalesce(property_subtype, case
      when property_category = 'rental' then case when coalesce(bhk[1], '') in ('PG','Room','1RK','1BHK','2BHK','House') then bhk[1] else 'House' end
      when property_category = 'plot' then case when plot_type = 'Agricultural' then 'Agricultural Land' when plot_type = 'Commercial' then 'Commercial Enclave' else 'Residential Gated Plot' end
      when property_category = 'commercial' then coalesce(commercial_type, 'Retail Shop')
      else coalesce(bhk[1] || 'BHK Apartment', 'Apartment') end),
    land_area_unit = coalesce(land_area_unit, 'sq. yard'),
    media_review_status = coalesce(media_review_status, 'approved');

alter table public.properties alter column property_pillar set default 'residential';
alter table public.properties alter column listing_intent set default 'sale';
alter table public.properties alter column media_review_status set default 'pending';
alter table public.properties
  add constraint properties_pillar_check check (property_pillar in ('residential','commercial','industrial','land')),
  add constraint properties_intent_check check (listing_intent in ('sale','rent')),
  add constraint properties_media_review_status_check check (media_review_status in ('pending','approved','rejected')),
  add constraint properties_nonnegative_sale_fees_check check (
    (stamp_duty_estimate is null or stamp_duty_estimate >= 0) and
    (legal_fees_estimate is null or legal_fees_estimate >= 0) and
    (security_deposit_amount is null or security_deposit_amount >= 0) and
    (lease_duration_months is null or lease_duration_months between 1 and 120)
  );

alter table public.properties add column if not exists total_on_road_valuation numeric(14,2)
  generated always as (case when price_min is null or stamp_duty_estimate is null or legal_fees_estimate is null then null else price_min + stamp_duty_estimate + legal_fees_estimate end) stored;

create or replace function orenzaa_private.guard_property_media_and_publication() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare is_admin boolean := (select auth.jwt()->>'email') = 'tellitorg1@gmail.com';
begin
  if tg_op = 'INSERT' then
    if coalesce(cardinality(new.photos),0) not between 2 and 4 then
      raise exception 'Listings require between 2 and 4 original property photos';
    end if;
    if not is_admin then
      new.media_review_status := 'pending';
      new.media_reviewed_by := null;
      new.media_reviewed_at := null;
      new.is_active := false;
    elsif new.media_review_status = 'approved' then
      new.media_reviewed_by := auth.uid();
      new.media_reviewed_at := now();
    end if;
  elsif new.photos is distinct from old.photos then
    if coalesce(cardinality(new.photos),0) not between 2 and 4 then
      raise exception 'Listings require between 2 and 4 original property photos';
    end if;
    if is_admin and new.media_review_status = 'approved' then
      new.media_reviewed_by := auth.uid();
      new.media_reviewed_at := now();
    else
      new.media_review_status := 'pending';
      new.media_reviewed_by := null;
      new.media_reviewed_at := null;
      new.is_active := false;
    end if;
  elsif not is_admin then
    new.media_review_status := old.media_review_status;
    new.media_reviewed_by := old.media_reviewed_by;
    new.media_reviewed_at := old.media_reviewed_at;
    if new.is_active is distinct from old.is_active or new.is_active then new.is_active := false; end if;
  elsif new.media_review_status = 'approved' and old.media_review_status is distinct from 'approved' then
    new.media_reviewed_by := auth.uid();
    new.media_reviewed_at := now();
  end if;

  if new.media_review_status <> 'approved' then new.is_active := false; end if;
  return new;
end $$;
revoke all on function orenzaa_private.guard_property_media_and_publication() from public, anon, authenticated;
drop trigger if exists guard_property_media_and_publication on public.properties;
create trigger guard_property_media_and_publication before insert or update on public.properties
for each row execute function orenzaa_private.guard_property_media_and_publication();

alter table public.leads add column if not exists urgency_timeline text;
alter table public.leads drop constraint if exists leads_urgency_timeline_check;
alter table public.leads add constraint leads_urgency_timeline_check check (
  urgency_timeline is null or urgency_timeline in ('today_tomorrow','next_3_7_days','next_15_days')
);

alter table public.vip_passes
  add column if not exists base_price_amount numeric(14,2),
  add column if not exists stamp_duty_amount numeric(14,2),
  add column if not exists legal_fees_amount numeric(14,2),
  add column if not exists purpose text,
  add column if not exists urgency_timeline text;

create or replace function orenzaa_private.create_vip_pass() returns trigger
language plpgsql security definer set search_path = '' as $$
declare property_data record;
begin
  if new.vip_pass_id is null then return new; end if;
  select coalesce(p.created_by,p.listed_by) as dealer_id, p.price_min, p.stamp_duty_estimate, p.legal_fees_estimate
    into property_data from public.properties p where p.id=new.property_id;
  insert into public.vip_passes (
    pass_id, lead_id, buyer_user_id, buyer_name, buyer_phone_masked, property_id, dealer_id,
    visit_timestamp, tagging_valid_until, disclaimer_accepted_at, base_price_amount,
    stamp_duty_amount, legal_fees_amount, purpose, urgency_timeline
  ) values (
    new.vip_pass_id, new.id, new.user_id, new.name,
    repeat('*', greatest(length(regexp_replace(new.phone,'[^0-9]','','g'))-4,0)) || right(regexp_replace(new.phone,'[^0-9]','','g'),4),
    new.property_id, property_data.dealer_id,
    (new.visit_date::timestamp at time zone 'Asia/Kolkata'),
    (new.visit_date::timestamp at time zone 'Asia/Kolkata') + interval '180 days',
    new.disclaimer_accepted_at, property_data.price_min, property_data.stamp_duty_estimate,
    property_data.legal_fees_estimate, new.purpose, new.urgency_timeline
  );
  return new;
end $$;
revoke all on function orenzaa_private.create_vip_pass() from public, anon, authenticated;

update public.vip_passes v set
  base_price_amount = p.price_min,
  stamp_duty_amount = p.stamp_duty_estimate,
  legal_fees_amount = p.legal_fees_estimate,
  purpose = l.purpose,
  urgency_timeline = l.urgency_timeline
from public.properties p join public.leads l on l.property_id=p.id
where l.id=v.lead_id;

alter table public.commissions
  add column if not exists orenzaa_share_percent numeric(5,2) not null default 40,
  add column if not exists closing_dealer_share_percent numeric(5,2) not null default 60,
  add column if not exists verified_deal_closed_at timestamptz;
alter table public.commissions drop constraint if exists commissions_share_split_check;
alter table public.commissions add constraint commissions_share_split_check check (
  orenzaa_share_percent between 30 and 50 and closing_dealer_share_percent between 50 and 70
  and orenzaa_share_percent + closing_dealer_share_percent = 100
);
alter table public.commissions add column if not exists orenzaa_share_amount bigint
  generated always as (round(coalesce(commission_amount,0) * orenzaa_share_percent / 100)::bigint) stored;
alter table public.commissions add column if not exists closing_dealer_share_amount bigint
  generated always as (coalesce(commission_amount,0) - round(coalesce(commission_amount,0) * orenzaa_share_percent / 100)::bigint) stored;

create or replace function orenzaa_private.mark_verified_commission_closure() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.status in ('Received','Paid','Deal Done','Closed') and old.status is distinct from new.status then
    new.verified_deal_closed_at := coalesce(new.verified_deal_closed_at, now());
  end if;
  return new;
end $$;
revoke all on function orenzaa_private.mark_verified_commission_closure() from public, anon, authenticated;
drop trigger if exists mark_verified_commission_closure on public.commissions;
create trigger mark_verified_commission_closure before update of status on public.commissions
for each row execute function orenzaa_private.mark_verified_commission_closure();

create table if not exists public.property_impressions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  impressed_at timestamptz not null default now()
);
create index if not exists property_impressions_property_id_idx on public.property_impressions(property_id);
alter table public.property_impressions enable row level security;
revoke all on public.property_impressions from public, anon, authenticated;
grant insert on public.property_impressions to anon, authenticated;
drop policy if exists "Record impressions for active listings" on public.property_impressions;
create policy "Record impressions for active listings" on public.property_impressions
for insert to anon, authenticated with check (
  user_id is not distinct from (select auth.uid()) and
  exists(select 1 from public.properties p where p.id=property_id and p.is_active)
);

create table if not exists public.dealer_lead_status_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  dealer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('Pending','Visited','Deal Closed')),
  changed_at timestamptz not null default now()
);
create index if not exists dealer_lead_status_log_owner_time_idx on public.dealer_lead_status_log(dealer_id,changed_at desc);
alter table public.dealer_lead_status_log enable row level security;
revoke all on public.dealer_lead_status_log from public, anon, authenticated;

create or replace function orenzaa_private.record_dealer_lead_status() returns trigger
language plpgsql security definer set search_path = '' as $$
declare listing_owner uuid; normalized text;
begin
  select coalesce(p.created_by,p.listed_by) into listing_owner from public.properties p where p.id=new.property_id;
  if listing_owner is null then return new; end if;
  normalized := case when new.status='Visited' then 'Visited' when new.status in ('Deal Done','Closed') then 'Deal Closed' else 'Pending' end;
  if tg_op='INSERT' then
    insert into public.dealer_lead_status_log(lead_id,dealer_id,status) values(new.id,listing_owner,normalized);
  elsif old.status is distinct from new.status then
    insert into public.dealer_lead_status_log(lead_id,dealer_id,status) values(new.id,listing_owner,normalized);
  end if;
  return new;
end $$;
revoke all on function orenzaa_private.record_dealer_lead_status() from public, anon, authenticated;
drop trigger if exists record_dealer_lead_status on public.leads;
create trigger record_dealer_lead_status after insert or update of status on public.leads
for each row execute function orenzaa_private.record_dealer_lead_status();

create or replace function orenzaa_private.get_dealer_audit() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); result jsonb;
begin
  if actor is null then raise exception 'Authentication required'; end if;
  with owned as (
    select p.id,p.title,p.price_min,p.description,p.photos,p.rera_number from public.properties p where p.created_by=actor or p.listed_by=actor
  ), metrics as (
    select o.id,o.title,
      (select count(*)::integer from public.property_impressions i where i.property_id=o.id) impressions,
      (select count(*)::integer from public.property_views v where v.property_id=o.id) views,
      (select count(*)::integer from public.vip_passes x where x.property_id=o.id) vip_passes,
      (select count(*)::integer from public.vip_passes x where x.property_id=o.id and x.tagging_valid_until>=now()) active_passes,
      (select count(*)::integer from public.leads l where l.property_id=o.id and l.status not in ('Visited','Deal Done','Closed')) pending,
      (select count(*)::integer from public.leads l where l.property_id=o.id and l.status='Visited') visited,
      (select count(*)::integer from public.leads l where l.property_id=o.id and l.status in ('Deal Done','Closed')) deal_closed,
      least(100,
        (case when o.price_min>0 then 10 else 0 end)+
        (case when length(coalesce(o.description,''))>=80 then 10 else 0 end)+
        (case when coalesce(cardinality(o.photos),0)>=2 then 10 else 0 end)+
        (case when nullif(trim(o.rera_number),'') is not null then 10 else 0 end)+
        least(30,round(300.0*(select count(*) from public.vip_passes x where x.property_id=o.id)/greatest((select count(*) from public.property_views v where v.property_id=o.id),1))::integer)+
        least(30,round(30.0*((select count(*) from public.leads l where l.property_id=o.id and l.status in ('Visited','Deal Done','Closed')))/greatest((select count(*) from public.vip_passes x where x.property_id=o.id),1))::integer)
      )::integer audit_score
    from owned o
  )
  select jsonb_build_object(
    'totals',jsonb_build_object(
      'impressions',coalesce((select sum(impressions) from metrics),0),
      'views',coalesce((select sum(views) from metrics),0),
      'vip_passes',coalesce((select sum(vip_passes) from metrics),0),
      'active_passes',coalesce((select sum(active_passes) from metrics),0),
      'pending',coalesce((select sum(pending) from metrics),0),
      'visited',coalesce((select sum(visited) from metrics),0),
      'deal_closed',coalesce((select sum(deal_closed) from metrics),0)
    ),
    'properties',coalesce((select jsonb_agg(jsonb_build_object(
      'id',m.id,'title',m.title,'impressions',m.impressions,'views',m.views,'vip_passes',m.vip_passes,
      'active_passes',m.active_passes,'pending',m.pending,'visited',m.visited,'deal_closed',m.deal_closed,'audit_score',m.audit_score
    ) order by m.views desc) from metrics m),'[]'::jsonb),
    'leads',coalesce((select jsonb_agg(jsonb_build_object(
      'id',l.id,'phone_masked','+91 XXXXX-'||right(regexp_replace(l.phone,'[^0-9]','','g'),4),'property_id',l.property_id,
      'property_title',p.title,'pass_id',l.vip_pass_id,'visit_date',l.visit_date,'purpose',l.purpose,
      'urgency_timeline',l.urgency_timeline,'created_at',l.created_at,'ai_score',l.ai_score,'tier',l.tier,
      'status',case when l.status='Visited' then 'Visited' when l.status in ('Deal Done','Closed') then 'Deal Closed' else 'Pending' end
    ) order by l.created_at desc) from public.leads l join owned p on p.id=l.property_id),'[]'::jsonb),
    'status_history',coalesce((select jsonb_agg(jsonb_build_object(
      'lead_id',h.lead_id,'status',h.status,'changed_at',h.changed_at
    ) order by h.changed_at desc) from (select * from public.dealer_lead_status_log where dealer_id=actor order by changed_at desc limit 50) h),'[]'::jsonb)
  ) into result;
  return result;
end $$;
revoke all on function orenzaa_private.get_dealer_audit() from public, anon, authenticated;
grant usage on schema orenzaa_private to authenticated;
grant execute on function orenzaa_private.get_dealer_audit() to authenticated;
create or replace function public.get_dealer_audit() returns jsonb
language sql security invoker set search_path = '' as $$ select orenzaa_private.get_dealer_audit() $$;
revoke all on function public.get_dealer_audit() from public, anon;
grant execute on function public.get_dealer_audit() to authenticated;
