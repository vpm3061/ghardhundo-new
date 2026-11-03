alter table public.vip_passes add column if not exists micro_market text;

update public.vip_passes v
set micro_market = coalesce(nullif(trim(concat_ws(', ', nullif(trim(p.locality),''), nullif(trim(p.city),''))),''),'As listed')
from public.properties p
where p.id = v.property_id;

create or replace function orenzaa_private.create_vip_pass() returns trigger
language plpgsql security definer set search_path = '' as $$
declare property_data record;
begin
  if new.vip_pass_id is null then return new; end if;
  select coalesce(p.created_by,p.listed_by) as dealer_id, p.price_min, p.stamp_duty_estimate,
    p.legal_fees_estimate, coalesce(nullif(trim(concat_ws(', ', nullif(trim(p.locality),''), nullif(trim(p.city),''))),''),'As listed') as micro_market
  into property_data from public.properties p where p.id=new.property_id;
  insert into public.vip_passes (
    pass_id, lead_id, buyer_user_id, buyer_name, buyer_phone_masked, property_id, dealer_id,
    visit_timestamp, tagging_valid_until, disclaimer_accepted_at, base_price_amount,
    stamp_duty_amount, legal_fees_amount, purpose, urgency_timeline, micro_market
  ) values (
    new.vip_pass_id, new.id, new.user_id, new.name,
    repeat('*', greatest(length(regexp_replace(new.phone,'[^0-9]','','g'))-4,0)) || right(regexp_replace(new.phone,'[^0-9]','','g'),4),
    new.property_id, property_data.dealer_id,
    (new.visit_date::timestamp at time zone 'Asia/Kolkata'),
    (new.visit_date::timestamp at time zone 'Asia/Kolkata') + interval '180 days',
    new.disclaimer_accepted_at, property_data.price_min, property_data.stamp_duty_estimate,
    property_data.legal_fees_estimate, new.purpose, new.urgency_timeline, property_data.micro_market
  );
  return new;
end $$;
