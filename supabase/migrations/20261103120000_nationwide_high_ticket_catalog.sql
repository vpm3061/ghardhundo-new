-- Enforce the nationwide high-ticket catalog while preserving legacy rows.
alter table public.properties drop constraint if exists properties_pillar_check;
drop trigger if exists guard_property_media_and_publication on public.properties;

update public.properties
set property_pillar = 'institutional'
where property_pillar = 'industrial';

update public.properties
set property_category = 'flat'
where property_category = 'rental';

alter table public.properties
  add constraint properties_pillar_check check (property_pillar in ('residential','commercial','institutional','land'));

create or replace function orenzaa_private.guard_property_media_and_publication() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  is_admin boolean := (select auth.jwt()->>'email') = 'tellitorg1@gmail.com';
  sale_price numeric;
  rent_price numeric;
  subtype_ok boolean;
begin
  if coalesce(cardinality(new.photos),0) not between 2 and 4 then
    raise exception 'Listings require between 2 and 4 original property photos';
  end if;

  if new.property_pillar not in ('residential','commercial','institutional','land') then
    raise exception 'Choose one of the four approved property pillars';
  end if;
  if new.listing_intent not in ('sale','rent') then
    raise exception 'Choose sale or rent/lease intent';
  end if;

  sale_price := coalesce(new.price_min,0);
  rent_price := coalesce(new.monthly_rent,0);
  subtype_ok := case new.property_pillar
    when 'residential' then new.property_subtype in ('3BHK Apartment','4BHK Apartment','Penthouse','Independent Villa','Gated Estate')
    when 'commercial' then new.property_subtype in ('Corporate Office Floor','High-Street Retail Outlet','Showroom')
    when 'land' then new.property_subtype in ('PDA / RERA Approved Township','Gated Commercial Enclave','Development Land')
    when 'institutional' then new.property_subtype in ('Warehouse','Logistics Park','Cold Storage')
    else false
  end;
  if not subtype_ok then raise exception 'This property type is not available in the premium catalog'; end if;
  if new.listing_intent = 'sale' and sale_price < 5000000 then
    raise exception 'Sale listings must start at INR 50 lakhs';
  end if;
  if new.listing_intent = 'rent' and (new.property_pillar = 'land' or rent_price < 50000) then
    raise exception 'Only luxury and high-value leases of at least INR 50,000 per month are allowed';
  end if;

  if tg_op = 'INSERT' then
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

-- Invalid legacy inventory remains stored for audit but is removed from public discovery.
update public.properties
set is_active = false
where is_active
  and (
    coalesce(cardinality(photos),0) not between 2 and 4
    or media_review_status <> 'approved'
    or property_subtype not in (
      '3BHK Apartment','4BHK Apartment','Penthouse','Independent Villa','Gated Estate',
      'Corporate Office Floor','High-Street Retail Outlet','Showroom',
      'PDA / RERA Approved Township','Gated Commercial Enclave','Development Land',
      'Warehouse','Logistics Park','Cold Storage'
    )
    or (listing_intent = 'sale' and coalesce(price_min,0) < 5000000)
    or (listing_intent = 'rent' and (property_pillar = 'land' or coalesce(monthly_rent,0) < 50000))
  );

create trigger guard_property_media_and_publication before insert or update on public.properties
for each row execute function orenzaa_private.guard_property_media_and_publication();
