-- Move seller phone numbers out of the PostgREST-exposed properties table.
create table if not exists orenzaa_private.property_contacts (
  property_id uuid primary key references public.properties(id) on delete cascade,
  owner_contact text not null,
  updated_at timestamptz not null default now()
);
revoke all on orenzaa_private.property_contacts from public, anon, authenticated;

insert into orenzaa_private.property_contacts(property_id, owner_contact)
select id, owner_contact from public.properties
where nullif(trim(owner_contact), '') is not null
on conflict (property_id) do update
set owner_contact = excluded.owner_contact, updated_at = now();

create or replace function orenzaa_private.capture_property_contact() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (tg_op = 'INSERT' and nullif(trim(new.owner_contact), '') is not null)
    or (tg_op = 'UPDATE' and new.owner_contact is distinct from old.owner_contact) then
    if nullif(trim(new.owner_contact), '') is null then
      delete from orenzaa_private.property_contacts where property_id = new.id;
    else
      insert into orenzaa_private.property_contacts(property_id, owner_contact)
      values (new.id, new.owner_contact)
      on conflict (property_id) do update
        set owner_contact = excluded.owner_contact, updated_at = now();
    end if;
  end if;
  new.owner_contact := null;
  return new;
end $$;
revoke all on function orenzaa_private.capture_property_contact() from public, anon, authenticated;

update public.properties set owner_contact = null where owner_contact is not null;
drop trigger if exists capture_property_contact on public.properties;
create trigger capture_property_contact before insert or update of owner_contact on public.properties
for each row execute function orenzaa_private.capture_property_contact();

create or replace function orenzaa_private.get_my_property_contact(p_property_id uuid) returns text
language sql stable security definer set search_path = '' as $$
  select c.owner_contact
  from orenzaa_private.property_contacts c
  join public.properties p on p.id = c.property_id
  where p.id = p_property_id
    and (p.created_by = auth.uid() or p.listed_by = auth.uid()
      or (select auth.jwt()->>'email') = 'tellitorg1@gmail.com')
$$;
revoke all on function orenzaa_private.get_my_property_contact(uuid) from public, anon;
grant usage on schema orenzaa_private to authenticated;
grant execute on function orenzaa_private.get_my_property_contact(uuid) to authenticated;

create or replace function public.get_my_property_contact(p_property_id uuid) returns text
language sql security invoker set search_path = '' as $$
  select orenzaa_private.get_my_property_contact(p_property_id)
$$;
revoke all on function public.get_my_property_contact(uuid) from public, anon;
grant execute on function public.get_my_property_contact(uuid) to authenticated;
