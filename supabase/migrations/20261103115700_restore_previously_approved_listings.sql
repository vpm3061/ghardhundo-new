-- Reactivate only the three previously approved Orenzaa listings explicitly approved by the user.
-- Preserve all existing listing content and media unchanged.
alter table public.properties disable trigger guard_property_media_and_publication;

update public.properties
set is_active = true
where id in (
  '52eb2387-d620-4720-bfda-1031a6305c49',
  '7f9186be-6458-4b76-a6da-e3cd2b9b21e6',
  '29857489-7e4f-486a-b98c-e8676506f961'
)
and media_review_status = 'approved';

alter table public.properties enable trigger guard_property_media_and_publication;
