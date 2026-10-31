create index if not exists dealer_lead_status_log_lead_id_idx
  on public.dealer_lead_status_log(lead_id);
create index if not exists property_impressions_user_id_idx
  on public.property_impressions(user_id);
create index if not exists properties_media_reviewed_by_idx
  on public.properties(media_reviewed_by);
