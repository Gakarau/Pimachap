# Phase 2 Backend Auth

Phase 2 starts the move away from client-only role checks.

## What Was Added

- Supabase migration:
  - [supabase/migrations/20260414_phase2_platform_auth.sql](/abs/path/C:/Users/USER/pimachap/supabase/migrations/20260414_phase2_platform_auth.sql:1)
- Server-side role resolver:
  - [src/lib/server-platform-auth.ts](/abs/path/C:/Users/USER/pimachap/src/lib/server-platform-auth.ts:1)
- API endpoint for authenticated server-backed role profile:
  - [src/app/api/platform/me/route.ts](/abs/path/C:/Users/USER/pimachap/src/app/api/platform/me/route.ts:1)

## New Database Tables

- `staff_accounts`
- `partner_memberships`
- `partner_applications`
- `partner_documents`
- `approval_decisions`
- `audit_events`
- `orders`
- `payments`
- `payout_batches`
- `payout_line_items`

## Required Environment

Add this on the server side:

```env
SUPABASE_SERVICE_ROLE_KEY=...
PARTNER_DOCUMENTS_BUCKET=partner-documents
```

Do not expose the service-role key to the browser.

## Intended Access Model

- Browser login still happens with Supabase OTP.
- Browser obtains an access token from the signed-in session.
- Frontend calls `/api/platform/me` with `Authorization: Bearer <access_token>`.
- Route handler validates the user against Supabase Auth.
- Server reads `staff_accounts` and `partner_memberships` with service-role access.
- Frontend uses that server-backed profile for protected workspace access.

## What This Unlocks Next

- Real server-enforced department access
- Real partner-lab scoping by membership
- Approval workflows for onboarding and KYC
- Payout approval and reconciliation flows

## Important Current State

The frontend is not yet fully switched to the API-backed profile as its only source of truth.
This change set establishes the schema and server path first so the app can migrate safely in the next step.
