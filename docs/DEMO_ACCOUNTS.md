# Staging Demo Accounts

These are synthetic accounts created by the guarded Prisma seed. They are for an isolated staging environment only; do not seed production or real customer data.

## Accounts

| Role | Sign-in identifier | Notes |
|---|---|---|
| Super Admin | `admin@buyme.lk` | Password comes from `SEED_SUPER_ADMIN_PASSWORD`; staging demo OTP is required |
| Store Admin | `manager.bm-s01@buyme.lk` through `manager.bm-s10@buyme.lk` | Password comes from `SEED_STORE_ADMIN_PASSWORD`; each account is assigned to its matching store |
| Rider | `+94771110001` or `rider.batti@buyme.lk` | Approved and assigned to the Batticaloa Town demo store |
| Customer | `+94772220001` | Has a sample home address |

Use the separately provisioned seed passwords and staging OTP through the client-controlled secret manager or another approved secure channel. No password or OTP value belongs in this repository.

## Staging-only OTP

The API uses `DEMO_OTP_CODE` only for seeded records marked `isDemoAccount=true`, and only when `APP_ENV=staging`, `NODE_ENV=production`, and `DEMO_OTP_ENABLED=true`. The code is stored using the normal OTP hash and expiry/attempt limits, but is not sent to SMS/email providers. The staging login screens display the code returned for those marked accounts.

For all non-demo identities, OTP delivery remains provider-backed. Demo mode is not registration OTP, and unseeded identities cannot use the mock code. `OTP_DEV_MODE` must remain `false` in staging.

## Safe setup order

1. Provision an isolated staging PostgreSQL database and review the pending Prisma migration.
2. Set `APP_ENV=staging`, `NODE_ENV=production`, `DEMO_OTP_ENABLED=true`, and a six-digit `DEMO_OTP_CODE` using the host's secret manager.
3. Keep `OTP_DEV_MODE=false`; configure Firebase, private object storage, ClamAV, OSM contact email, CORS, and distinct JWT secrets as required by API validation.
4. Set `ALLOW_DEMO_SEED=true` only for the one approved empty-database seed run, along with strong `SEED_SUPER_ADMIN_PASSWORD` and `SEED_STORE_ADMIN_PASSWORD` values.
5. Disable/remove the seed opt-in immediately after the seed. Never run this seed against production.

This repository contains the additive migration and seed changes only. No Supabase project has been provisioned, and neither migration nor seed has been run against a hosted database.
