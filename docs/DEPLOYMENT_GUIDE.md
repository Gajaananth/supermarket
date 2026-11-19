# Deployment Guide

**Status: NOT DEPLOYED.** Hosting, DNS/domain, production PostgreSQL, private object storage, provider accounts, and Play Console access have not been supplied or verified. This is a deployment checklist, not evidence that a production environment exists.

## Selected staging direction

- Next.js web frontend: Firebase App Hosting.
- API runtime: Google Cloud Run using the container definition at `apps/api/Dockerfile`; Cloudflare DNS/WAF will proxy to the Cloud Run service. Cloudflare Workers are not the API runtime.
- Database: Supabase PostgreSQL is planned, but the project and credentials are not yet available.
- Cloud Run is selected, but no GCP project, region, Artifact Registry repository, service account, or live environment has been supplied or created.
- Staging demo identities and OTP setup are documented in [Staging Demo Accounts](./DEMO_ACCOUNTS.md). Their seed requires explicit opt-in and must never target production.

## Cloud Run API preparation

- Build from the repository root so the Docker build can include the local API-contract package:
  `docker build -f apps/api/Dockerfile -t REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/buyme-api:TAG .`
- The default `runtime` target serves on port 8080. The separate `migration` target contains Prisma CLI tooling and runs `prisma migrate deploy`; use it only as an explicitly approved one-off Cloud Run Job with a database credential scoped for migrations.
- Do not run `prisma migrate dev` in Cloud Run or deploy migrations automatically on service startup.
- Store `DATABASE_URL`, both JWT secrets, `DEMO_OTP_CODE`, Firebase service-account JSON, and object-storage credentials in Secret Manager. Set non-secret staging configuration such as `APP_ENV=staging`, `NODE_ENV=production`, `DEMO_OTP_ENABLED=true`, the exact `CORS_ALLOWED_ORIGINS`, `OSM_CONTACT_EMAIL`, object-storage bucket/endpoint, and `CLAMAV_HOST`.
- The image does not contain `.env` files and does not seed data. Keep `ALLOW_DEMO_SEED` off except for the separately approved seed run against an empty staging database.
- Configure Cloud Run health checks against `/health`, sufficient request timeout for authenticated Socket.IO connections, and the required network path to Supabase, private object storage, and ClamAV.
- Publish the Cloud Run service through Cloudflare only after the actual domain, TLS, WAF rules, origins, and Firebase App Hosting backend URL are approved.

## Before provisioning

- Choose a region and provider with PostgreSQL backups, restore procedures, TLS, monitoring, and data-processing terms suitable for Sri Lankan customer and rider information.
- Provision separate staging and production resources. Keep customer data out of staging.
- Decide the canonical web/API origins and configure TLS and `CORS_ALLOWED_ORIGINS` with the exact deployed HTTPS origins for both REST and Socket.IO. The API rejects non-allowlisted browser origins; localhost origins are rejected in production.
- Configure private storage for KYC and deposit slips, deny public access, restrict API IAM permissions, configure temporary-upload lifecycle deletion, and test signed upload/download URLs.
- Provide reachable ClamAV scanning; KYC submissions are expected to fail closed when scanning is unavailable.
- Select SMS and email providers and verify sender identity and delivery in Sri Lanka. Configure Firebase project credentials for push.
- Decide whether public OSM/OSRM endpoints are appropriate for the expected traffic. Production requires a contact email; public endpoints are not an availability commitment.
- Complete privacy, terms, retention, support, and incident-response review with qualified client/legal owners.

## Release sequence

1. Rerun dependency audits at release time. Current API, Admin web, and API contract npm audits report zero vulnerabilities; the CI audit job blocks on high findings. Flutter/Dart dependency audit remains outstanding.
2. Build from a reviewed commit using the CI pipeline. Do not deploy from an unverified workstation build.
3. Create isolated GCP/Supabase staging resources and load secrets through Secret Manager. Do not apply the pending demo-account migration or seed until the target database is confirmed and approved.
4. Confirm health check, logs, TLS, CORS allowlist, rate limits, file scanning, notification delivery, and backup schedule.
5. Take a database backup and verify a restore before the first production migration.
6. Review every pending Prisma migration against the exact target and backup. Apply only with explicit environment approval using the release operator's approved procedure; do not run `prisma migrate dev` against production.
7. Deploy the API and web application, then run a small, bounded staging smoke test using synthetic accounts and orders.
8. Release Android builds to internal testing first; verify login, permissions, push, uploads, COD lifecycle, and account deletion before wider rollout.
9. Record release version, migration state, backup identifier, smoke-test result, and rollback owner.

## Rollback

- Roll back application artifacts to the last known-good release where schema compatibility permits.
- Prefer forward corrective migrations for additive schema changes. Do not restore or overwrite a production database merely to roll back application code.
- If data corruption or exposure is suspected, stop affected writes, preserve logs/evidence, notify the incident owner, and use the runbook.

No GCP project, Firebase App Hosting app, Supabase database, Cloudflare zone, deployment secret, public URL, or release was configured or tested during preparation of this guide.
See [Client Accounts and External Access Blockers](./CLIENT_ACCOUNTS_AND_EXTERNAL_ACCESS.md) for the complete client-owned dependency list.
