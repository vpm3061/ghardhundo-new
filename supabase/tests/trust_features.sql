-- Rollback-only integration test: no test users, listings, leads or alerts remain.
begin;
do $$
declare buyer uuid := gen_random_uuid(); other_user uuid := gen_random_uuid(); property uuid := gen_random_uuid();
begin
  perform set_config('test.buyer',buyer::text,true);
  perform set_config('test.other_user',other_user::text,true);
  perform set_config('test.property',property::text,true);
  insert into auth.users(id,email,raw_user_meta_data) values
    (buyer,'trust-test-'||buyer||'@example.invalid','{}'),
    (other_user,'trust-test-'||other_user||'@example.invalid','{}');
  insert into public.properties(id,title,city,is_active,listing_type,carpet_area,rera_number,created_by)
    values(property,'Trust integration test','Lucknow',true,'builder',1000,'TEST-NOT-A-REAL-RERA',buyer);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',buyer,'email','trust-buyer@example.invalid','role','authenticated')::text,true);
end $$;
set local role authenticated;
do $$
declare lead uuid; pass text; request uuid := gen_random_uuid();
begin
  insert into public.leads(user_id,property_id,name,phone,visit_date,request_id,whatsapp_consent)
    values(auth.uid(),current_setting('test.property')::uuid,'Trust test buyer','+919876543210',
      (now() at time zone 'Asia/Kolkata')::date + 1,request,true)
    returning id,vip_pass_id into lead,pass;
  perform set_config('test.lead',lead::text,true);
  if pass not like 'ORZ-VIP-%' then raise exception 'Pass was not created'; end if;
  if not exists(select 1 from public.leads where id=lead and source_tag='Orenzaa-001'
    and lead_id=id and client_name=name and client_phone=phone and project_id=property_id) then
    raise exception 'Lead aliases or owner visibility failed'; end if;
  if exists(select 1 from public.lead_notifications where lead_id=lead) then raise exception 'Buyer saw admin payload'; end if;
  begin
    insert into public.leads(user_id,name,phone,request_id) values(auth.uid(),'Duplicate','+919876543210',request);
    raise exception 'Duplicate request accepted';
  exception when unique_violation then null; end;
  begin
    insert into public.leads(user_id,name,phone) values(current_setting('test.other_user')::uuid,'Forged owner','+919876543210');
    raise exception 'Forged owner accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.properties set orenzaa_verified=true where id=current_setting('test.property')::uuid;
    raise exception 'Owner could self-verify';
  exception when raise_exception then
    if SQLERRM <> 'Only Orenzaa admins can approve verification and pricing' then raise; end if;
  end;
  begin
    insert into public.leads(user_id,property_id,name,phone,visit_date) values(auth.uid(),current_setting('test.property')::uuid,
      'Invalid date','+919876543210',(now() at time zone 'Asia/Kolkata')::date-1);
    raise exception 'Past visit date accepted';
  exception when raise_exception then
    if SQLERRM <> 'Choose a visit date within the next 90 days' then raise; end if;
  end;
  insert into public.leads(user_id,name,phone,whatsapp_consent)
    values(auth.uid(),'General enquiry','+919876543210',false);
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.other_user'),'email','other@example.invalid','role','authenticated')::text,true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.leads where id=current_setting('test.lead')::uuid) then raise exception 'Other user saw private lead'; end if;
  if exists(select 1 from public.lead_notifications) then raise exception 'Other user saw alerts'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"anon"}',true);
set local role anon;
do $$ begin
  begin
    perform 1 from public.leads limit 1;
    raise exception 'Anonymous lead access allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.other_user'),'email','tellitorg1@gmail.com','role','authenticated')::text,true);
set local role authenticated;
do $$
declare n integer; payload jsonb;
begin
  select count(*) into n from public.lead_notifications where lead_id=current_setting('test.lead')::uuid;
  if n <> 1 then raise exception 'Expected exactly one atomic notification'; end if;
  select ln.payload into payload from public.lead_notifications ln where lead_id=current_setting('test.lead')::uuid;
  if payload->'whatsapp'->>'consent' <> 'true' or payload->>'pass_id' not like 'ORZ-VIP-%' then raise exception 'Provider payload invalid'; end if;
  if exists(select 1 from public.lead_notifications ln join public.leads l on l.id=ln.lead_id
    where l.user_id=current_setting('test.buyer')::uuid and not l.whatsapp_consent
      and ln.payload->'whatsapp' <> 'null'::jsonb) then raise exception 'Opt-out was not respected'; end if;
  update public.leads set status='Tagged' where id=current_setting('test.lead')::uuid;
  update public.leads set status='Visited' where id=current_setting('test.lead')::uuid;
  update public.leads set status='Closed' where id=current_setting('test.lead')::uuid;
  if not found then raise exception 'Admin status workflow failed'; end if;
  update public.properties set orenzaa_verified=true,base_carpet_rate=5000,government_charges_estimate=350000,
    gst_estimate=0,maintenance_estimate=50000,other_charges_estimate=0,direct_builder_pricing=true
    where id=current_setting('test.property')::uuid;
  if not found then raise exception 'Admin verification update failed'; end if;
  begin
    update public.leads set sold_to_dealer=current_setting('test.other_user')::uuid where id=current_setting('test.lead')::uuid;
    raise exception 'Contact resale accepted';
  exception when raise_exception then
    if SQLERRM <> 'Buyer contact details cannot be sold' then raise; end if;
  end;
end $$;
reset role;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.buyer'),'email','trust-buyer@example.invalid','role','authenticated')::text,true);
set local role authenticated;
do $$ begin
  update public.properties set price_min=123456 where id=current_setting('test.property')::uuid;
  if exists(select 1 from public.properties where id=current_setting('test.property')::uuid
    and (orenzaa_verified or direct_builder_pricing or base_carpet_rate is not null)) then
    raise exception 'Owner edit failed to invalidate verified pricing'; end if;
end $$;
reset role;
rollback;
select 'PASS: privacy, idempotency, VIP persistence, provider payload, CRM statuses and verification guards; all test data rolled back' as result;
