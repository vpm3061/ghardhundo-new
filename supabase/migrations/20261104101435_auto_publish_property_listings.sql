-- Property owners' listings go live immediately after the existing schema and photo-count checks.
-- Admin photo approval is no longer required to publish a listing.
create or replace function orenzaa_private.guard_property_media_and_publication()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sale_price numeric;
  rent_price numeric;
  subtype_ok boolean;
begin
  if coalesce(cardinality(new.photos), 0) not between 2 and 4 then
    raise exception 'Listings require between 2 and 4 property photos';
  end if;

  if new.property_pillar not in ('residential', 'commercial', 'institutional', 'land') then
    raise exception 'Choose one of the four property pillars';
  end if;
  if new.listing_intent not in ('sale', 'rent') then
    raise exception 'Choose sale or rent/lease intent';
  end if;

  sale_price := coalesce(new.price_min, 0);
  rent_price := coalesce(new.monthly_rent, 0);
  subtype_ok := case new.property_pillar
    when 'residential' then new.property_subtype in ('3BHK Apartment', '4BHK Apartment', 'Penthouse', 'Independent Villa', 'Gated Estate')
    when 'commercial' then new.property_subtype in ('Corporate Office Floor', 'High-Street Retail Outlet', 'Showroom')
    when 'land' then new.property_subtype in ('PDA / RERA Approved Township', 'Gated Commercial Enclave', 'Development Land')
    when 'institutional' then new.property_subtype in ('Warehouse', 'Logistics Park', 'Cold Storage')
    else false
  end;
  if not subtype_ok then raise exception 'Choose a valid property subtype'; end if;
  if new.listing_intent = 'sale' and sale_price < 5000000 then
    raise exception 'Sale listings must start at INR 50 lakhs';
  end if;
  if new.listing_intent = 'rent' and (new.property_pillar = 'land' or rent_price < 50000) then
    raise exception 'Rent listings must be at least INR 50,000 per month';
  end if;

  -- The status is retained for compatibility; publication no longer waits for an admin review.
  new.media_review_status := 'approved';
  new.media_reviewed_by := null;
  new.media_reviewed_at := null;
  return new;
end;
$$;
