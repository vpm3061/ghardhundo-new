-- A property must exist before its private contact can reference it.
-- New listings save contact details through set_my_property_contact after insert.
create or replace function orenzaa_private.capture_property_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.owner_contact := null;
    return new;
  end if;

  if new.owner_contact is distinct from old.owner_contact then
    if nullif(trim(new.owner_contact), '') is null then
      delete from orenzaa_private.property_contacts
      where property_id = new.id;
    else
      insert into orenzaa_private.property_contacts (property_id, owner_contact)
      values (new.id, new.owner_contact)
      on conflict (property_id) do update
        set owner_contact = excluded.owner_contact;
    end if;
  end if;

  new.owner_contact := null;
  return new;
end;
$$;
