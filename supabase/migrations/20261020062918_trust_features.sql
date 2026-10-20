-- Additive: retain existing field names and legacy CRM statuses.
alter table public.leads
  add column if not exists source_tag text not null default 'Orenzaa-001',
  add column if not exists request_id uuid,
  add column if not exists visit_date date,
  add column if not exists vip_pass_id text,
  add column if not exists project_name text,
  add column if not exists whatsapp_consent boolean not null default false,
  add column if not exists referrer_id uuid,
  add column if not exists lead_id uuid generated always as (id) stored,
  add column if not exists client_name text generated always as (name) stored,
  add column if not exists client_phone text generated always as (phone) stored,
  add column if not exists project_id uuid generated always as (property_id) stored;
create unique index leads_request_id_unique on public.leads(user_id, request_id);
create unique index leads_vip_pass_unique on public.leads(vip_pass_id) where vip_pass_id is not null;
alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check
  (status in ('New','Tagged','Visited','Closed','Called','Visit Fixed','Deal Done','Not Interested','Lost'));

-- Restrictive policies also constrain any existing permissive policies.
alter table public.leads enable row level security;
create policy "Trust lead read boundary" on public.leads as restrictive for select
  to anon, authenticated using (
    (select auth.uid()) = user_id or (select auth.jwt()->>'email') = 'tellitorg1@gmail.com'
  );
create policy "Trust lead insert boundary" on public.leads as restrictive for insert
  to authenticated with check (
    (select auth.uid()) = user_id and source_tag = 'Orenzaa-001' and status = 'New'
  );
create policy "Trust lead update boundary" on public.leads as restrictive for update
  to authenticated using ((select auth.jwt()->>'email') = 'tellitorg1@gmail.com')
  with check ((select auth.jwt()->>'email') = 'tellitorg1@gmail.com');
revoke all on public.leads from anon;

alter table public.properties
  add column if not exists orenzaa_verified boolean not null default false,
  add column if not exists verified_at timestamptz,
  add column if not exists base_carpet_rate numeric check (base_carpet_rate >= 0),
  add column if not exists government_charges_estimate numeric check (government_charges_estimate >= 0),
  add column if not exists gst_estimate numeric check (gst_estimate >= 0),
  add column if not exists maintenance_estimate numeric check (maintenance_estimate >= 0),
  add column if not exists other_charges_estimate numeric check (other_charges_estimate >= 0),
  add column if not exists direct_builder_pricing boolean not null default false;

create schema if not exists orenzaa_private;
revoke all on schema orenzaa_private from public, anon, authenticated;

create function orenzaa_private.guard_property_trust() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare is_admin boolean := coalesce(auth.jwt()->>'email' = 'tellitorg1@gmail.com', false);
begin
  if not is_admin then
    if TG_OP = 'INSERT' then
      if new.orenzaa_verified or new.direct_builder_pricing or new.verified_at is not null
        or new.base_carpet_rate is not null or new.government_charges_estimate is not null
        or new.gst_estimate is not null or new.maintenance_estimate is not null
        or new.other_charges_estimate is not null then
        raise exception 'Only Orenzaa admins can approve verification and pricing';
      end if;
    else
      if (new.orenzaa_verified,new.direct_builder_pricing,new.verified_at,new.base_carpet_rate,
          new.government_charges_estimate,new.gst_estimate,new.maintenance_estimate,new.other_charges_estimate)
        is distinct from
         (old.orenzaa_verified,old.direct_builder_pricing,old.verified_at,old.base_carpet_rate,
          old.government_charges_estimate,old.gst_estimate,old.maintenance_estimate,old.other_charges_estimate) then
        raise exception 'Only Orenzaa admins can approve verification and pricing';
      end if;
      if (new.title,new.rera_number,new.price_min,new.carpet_area,new.listing_type,new.property_category)
        is distinct from (old.title,old.rera_number,old.price_min,old.carpet_area,old.listing_type,old.property_category) then
        new.orenzaa_verified := false; new.direct_builder_pricing := false; new.verified_at := null;
        new.base_carpet_rate := null; new.government_charges_estimate := null;
        new.gst_estimate := null; new.maintenance_estimate := null; new.other_charges_estimate := null;
      end if;
    end if;
  end if;
  if new.orenzaa_verified and nullif(trim(new.rera_number),'') is null then
    raise exception 'RERA number is required for verification';
  end if;
  if new.direct_builder_pricing and (not new.orenzaa_verified or new.listing_type is distinct from 'builder'
    or new.base_carpet_rate is null or new.base_carpet_rate <= 0 or coalesce(new.carpet_area,0) <= 0
    or new.government_charges_estimate is null or new.gst_estimate is null
    or new.maintenance_estimate is null or new.other_charges_estimate is null) then
    raise exception 'Direct builder pricing requires verified builder listing and a complete price breakdown';
  end if;
  if new.orenzaa_verified then new.verified_at := coalesce(new.verified_at,now());
  else new.verified_at := null; end if;
  return new;
end $$;
revoke all on function orenzaa_private.guard_property_trust() from public, anon, authenticated;
create trigger guard_property_trust before insert or update on public.properties
  for each row execute function orenzaa_private.guard_property_trust();

create table public.lead_notifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  event_type text not null default 'lead.created',
  payload jsonb not null
);
alter table public.lead_notifications enable row level security;
revoke all on public.lead_notifications from anon, authenticated;
grant select, update on public.lead_notifications to authenticated;
grant all on public.lead_notifications to service_role;
create policy "Admin reads lead alerts" on public.lead_notifications for select to authenticated
  using ((select auth.jwt()->>'email') = 'tellitorg1@gmail.com');
create policy "Admin acknowledges lead alerts" on public.lead_notifications for update to authenticated
  using ((select auth.jwt()->>'email') = 'tellitorg1@gmail.com')
  with check ((select auth.jwt()->>'email') = 'tellitorg1@gmail.com');

create function orenzaa_private.prepare_trust_lead() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    -- Serialize per-user submission checks; retries remain possible through request_id.
    perform pg_advisory_xact_lock(hashtextextended(new.user_id::text,0));
    if exists(select 1 from public.leads where user_id = new.user_id and created_at > now() - interval '1 hour'
      group by user_id having count(*) >= 10) then
      raise exception 'Too many requests. Please try again later.';
    end if;
    if length(trim(new.name)) not between 2 and 100 or new.phone !~ '^\+?[0-9]{10,15}$' then
      raise exception 'Please enter a valid name and phone number';
    end if;
    new.source_tag := 'Orenzaa-001';
    new.status := 'New';
    new.created_at := now();
    new.sold_to_dealer := null;
    if new.property_id is not null then
      select title into new.project_name from public.properties where id = new.property_id and is_active;
      if not found then raise exception 'Property is no longer available'; end if;
    else new.project_name := 'General enquiry'; end if;
    if new.visit_date is not null then
      if new.property_id is null or new.visit_date < (now() at time zone 'Asia/Kolkata')::date
        or new.visit_date > (now() at time zone 'Asia/Kolkata')::date + 90 then
        raise exception 'Choose a visit date within the next 90 days';
      end if;
      new.vip_pass_id := 'ORZ-VIP-' || upper(replace(gen_random_uuid()::text,'-',''));
    else new.vip_pass_id := null; end if;
  else
    if new.sold_to_dealer is not null and new.sold_to_dealer is distinct from old.sold_to_dealer then
      raise exception 'Buyer contact details cannot be sold';
    end if;
    if (new.vip_pass_id,new.visit_date,new.project_name,new.source_tag,new.user_id,new.property_id,new.request_id)
      is distinct from (old.vip_pass_id,old.visit_date,old.project_name,old.source_tag,old.user_id,old.property_id,old.request_id) then
      raise exception 'Booking identity is immutable; create a new booking to reschedule';
    end if;
  end if;
  return new;
end $$;
revoke all on function orenzaa_private.prepare_trust_lead() from public, anon, authenticated;
create trigger prepare_trust_lead before insert or update on public.leads
  for each row execute function orenzaa_private.prepare_trust_lead();

-- Definer is limited to an AFTER INSERT trigger, never a callable public RPC.
-- It writes the admin-only alert atomically with the lead; no external delivery dependency.
create function orenzaa_private.notify_trust_lead() returns trigger
language plpgsql security definer set search_path = '' as $$
declare message text;
begin
  if auth.uid() is null or auth.uid() is distinct from new.user_id then
    raise exception 'An authenticated lead owner is required';
  end if;
  message := format(E'Hello %s,\nYour Orenzaa Digital VIP Site Visit Pass is ready.\nProject: %s\nPass ID: %s\nRequested visit date: %s\nMapped under Orenzaa Partner Network\nOur team will confirm the visit time.',
    new.name,new.project_name,new.vip_pass_id,new.visit_date);
  insert into public.lead_notifications(lead_id,event_type,payload)
  values (new.id,case when new.vip_pass_id is null then 'lead.created' else 'visit.requested' end,
    jsonb_build_object(
      'version',1,'lead_id',new.id,'client_name',new.name,'client_phone',new.phone,
      'project_id',new.property_id,'project_name',new.project_name,'source_tag',new.source_tag,
      'status',new.status,'pass_id',new.vip_pass_id,'visit_date',new.visit_date,
      'tagging_notice','Mapped under Orenzaa Partner Network',
      'whatsapp',case when new.vip_pass_id is not null and new.whatsapp_consent then
        jsonb_build_object('to',new.phone,'message',message,'consent',true,
          'template_parameters',jsonb_build_array(new.name,new.project_name,new.vip_pass_id,new.visit_date::text))
        else null end));
  return new;
end $$;
revoke all on function orenzaa_private.notify_trust_lead() from public, anon, authenticated;
create trigger notify_trust_lead after insert on public.leads
  for each row execute function orenzaa_private.notify_trust_lead();
do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime')
    and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime'
      and schemaname='public' and tablename='lead_notifications') then
    alter publication supabase_realtime add table public.lead_notifications;
  end if;
end $$;
