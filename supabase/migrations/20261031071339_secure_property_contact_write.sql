create or replace function orenzaa_private.set_my_property_contact(p_property_id uuid, p_owner_contact text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.properties p where p.id = p_property_id
      and (p.created_by = auth.uid() or p.listed_by = auth.uid()
        or (select auth.jwt()->>'email') = 'tellitorg1@gmail.com')
  ) then raise exception 'Not authorized to update this listing contact'; end if;
  if nullif(trim(p_owner_contact), '') is null then
    delete from orenzaa_private.property_contacts where property_id = p_property_id;
  else
    insert into orenzaa_private.property_contacts(property_id, owner_contact)
    values (p_property_id, trim(p_owner_contact))
    on conflict (property_id) do update
      set owner_contact = excluded.owner_contact, updated_at = now();
  end if;
end $$;
revoke all on function orenzaa_private.set_my_property_contact(uuid,text) from public, anon;
grant execute on function orenzaa_private.set_my_property_contact(uuid,text) to authenticated;

create or replace function public.set_my_property_contact(p_property_id uuid, p_owner_contact text) returns void
language sql security invoker set search_path = '' as $$
  select orenzaa_private.set_my_property_contact(p_property_id, p_owner_contact)
$$;
revoke all on function public.set_my_property_contact(uuid,text) from public, anon;
grant execute on function public.set_my_property_contact(uuid,text) to authenticated;
