# Phase 1 RBAC

This project now supports protected workspaces for:

- `owner` -> `/admin`
- `ops` -> `/ops`
- `compliance` -> `/compliance`
- `finance` -> `/finance`
- `partner_lab` -> `/partner`

## Current Role Sources

Roles are resolved in this order from the authenticated Supabase user:

1. `app_metadata.roles`
2. `user_metadata.roles`
3. `app_metadata.platform_role`
4. `user_metadata.platform_role`
5. bootstrap phone mappings from `NEXT_PUBLIC_*_PHONES`

Partner-lab scope is read from:

1. `app_metadata.lab_ids`
2. `user_metadata.lab_ids`
3. bootstrap `NEXT_PUBLIC_PARTNER_LAB_IDS`

## Recommended Supabase Metadata

Example:

```json
{
  "platform_role": "partner_lab",
  "roles": ["partner_lab"],
  "lab_ids": ["lab_123"]
}
```

For owner or department staff:

```json
{
  "roles": ["owner"]
}
```

## Bootstrap Env Vars

These are optional shortcuts so Phase 1 can work immediately before you build admin-user tables:

```env
NEXT_PUBLIC_OWNER_PHONES=+254700000001
NEXT_PUBLIC_OPS_PHONES=
NEXT_PUBLIC_COMPLIANCE_PHONES=
NEXT_PUBLIC_FINANCE_PHONES=
NEXT_PUBLIC_PARTNER_LAB_PHONES=
NEXT_PUBLIC_PARTNER_LAB_IDS=
```

These should only be treated as a bootstrap mechanism.

## Important Limitation

Current authorization is enforced in the client because the app still uses browser-only Supabase auth state.

To harden this in the next phase, move to:

- server-readable auth/session cookies
- server-side authorization checks
- role tables such as `staff_accounts`, `partner_accounts`, and `partner_memberships`
- RLS policies keyed to role and lab scope
