alter table public.properties drop constraint if exists properties_no_rental_category;
alter table public.properties
  add constraint properties_no_rental_category check (property_category <> 'rental');
