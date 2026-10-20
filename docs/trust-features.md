# Orenzaa trust workflow

All three enquiry entry points use `POST /api/leads`. Authentication is checked with `getUser`; user identity, scoring and source tag are not accepted from browser input. An idempotency UUID prevents duplicate lead/pass creation when a submission is retried.

The additive migration retains legacy lead fields and statuses. Generated `lead_id`, `client_name`, `client_phone` and `project_id` aliases expose the requested contract without renaming existing columns. New CRM states are `New`, `Tagged`, `Visited`, `Closed`; legacy records remain supported.

## Privacy and admin alerts

Leads are readable only by their submitting user and the Orenzaa admin. Contact resale/reveal is disabled. New assignments to `sold_to_dealer` are blocked. Public and other authenticated users cannot read notification payloads.

Every new lead atomically inserts an admin-only `lead_notifications` event. The admin shell subscribes to INSERT events through Supabase Realtime and polls every 30 seconds to recover missed events. An alert is persisted even when the admin is offline. Marking an alert read does not delete the lead.

## Verification and pricing

Open Admin → Properties → Full Edit → Orenzaa Verification & Price Transparency.

Save listing edits first, verify the RERA record and the builder quote, then save approval and pricing separately. Only the administrator can set protected trust fields. Owner changes to identity, RERA, price or carpet area invalidate existing approval and estimates.

Amounts are property-specific estimates in INR, not statutory tax rates. Maintenance should be quoted for the period explained in the listing description. Blank means unknown; zero means confirmed not applicable. A total appears only when all components are supplied. The direct-builder promise requires a verified builder listing, carpet rate and area, and every charge amount.

## VIP pass and WhatsApp provider handoff

The database creates a unique pass ID and saves the requested visit date. The success screen never claims the visit time is confirmed. Buyers can download an SVG pass, share its text manually in WhatsApp, and retrieve recent passes on their profile or `/visits` (available to every signed-in role).

Automatic WhatsApp delivery is intentionally **not enabled**, per the user's choice to connect a provider later.

The database notification contains a provider-neutral payload:

```json
{
  "version": 1,
  "lead_id": "<uuid>",
  "client_name": "<name>",
  "client_phone": "<phone>",
  "project_id": "<uuid>",
  "project_name": "<project>",
  "source_tag": "Orenzaa-001",
  "status": "New",
  "pass_id": "ORZ-VIP-<unique-id>",
  "visit_date": "YYYY-MM-DD",
  "tagging_notice": "Mapped under Orenzaa Partner Network",
  "whatsapp": {
    "to": "<phone>",
    "message": "<formatted visit message>",
    "consent": true,
    "template_parameters": ["<name>", "<project>", "<pass-id>", "<date>"]
  }
}
```

`whatsapp` is null if the buyer did not opt in or the lead is not a site visit. The admin can download the event from a lead's detail page (`GET /api/admin/lead-payload/:id`); it is authenticated, admin-only and never cached.

When connecting Meta, Twilio or Interakt:

1. Configure a database INSERT webhook on `lead_notifications` to a private Edge Function.
2. Verify a dedicated shared secret, then use `record.id` as the delivery idempotency key.
3. Skip null WhatsApp payloads. Normalize/validate the destination with the provider.
4. Map `template_parameters` to the provider's approved transactional template. Keep provider credentials in Edge Function secrets.
5. Persist provider IDs, attempt counts and delivery status separately; retry transient failures without creating another lead or pass.

No email/WhatsApp provider credentials or external delivery are required for the internal admin notification workflow.

## Verification

- `node --test tests/trust.test.mjs`
- `npx.cmd tsc --noEmit`
- Rollback-only database tests in `supabase/tests/trust_features.sql` cover owner/admin access, unrelated users, anonymous access, status changes, unique pass creation, duplicate submissions, protected property fields and atomic alert creation.

## Existing project advisor findings

The security advisor did not flag the new trust tables/functions. It reported existing findings outside this change:

- [`builders` has RLS without policies](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- [Mutable search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable) on `handle_new_user` and `update_updated_at`.
- [`handle_new_user` has public definer execution grants](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable).
- [Leaked password protection is disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Those pre-existing auth functions and account settings were not changed by this implementation.
