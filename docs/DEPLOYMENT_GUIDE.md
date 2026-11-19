# Deployment Guide

**Status: Worker bootstrap deployed; application not deployed.** The Firebase project exists on the Spark plan ($0/month), and the client supplied a Supabase staging project URL. The `buyme-api` Worker is live at https://buyme-api.acceseries.workers.dev, but intentionally returns HTTP 503 with `BACKEND_NOT_CONFIGURED`. No schema, site, or functional public app has been deployed. Do not enable billing as part of this guide.

## Selected no-billing direction

- Firebase Hosting will hold the statically exported admin frontend.
- A Cloudflare Worker is deployed as a bootstrap. It is not yet the public same-origin entry point, and it does not proxy Firebase assets or handle sessions/API requests.
- Supabase PostgreSQL is the planned database; the project exists but its schema has not been applied and the application is not connected.
- Firebase App Hosting is not selected because it requires the Blaze billing plan. Keep the Firebase project on Spark.
- The functional architecture is not implemented yet. The current Next.js app depends on API route handlers and middleware that static Firebase Hosting cannot run. The current NestJS/Prisma API also cannot be deployed unchanged as a Cloudflare Worker. Both require a substantial refactor before any functional deployment.
- Staging demo identities and OTP setup are documented in [Staging Demo Accounts](./DEMO_ACCOUNTS.md). Their seed requires explicit opt-in and must never target production.

## Free-tier migration gates

1. Make the Next.js admin UI statically exportable and move its server routes and auth/session enforcement to the Worker without weakening httpOnly-cookie protection.
2. Port the active API behavior and persistence to a Worker-compatible implementation backed by Supabase. Preserve role checks, OTP/2FA, refresh-token rotation, transactional stock/order operations, and upload authorization.
3. Configure the Worker as the public entry point so Firebase and API requests remain same-origin; direct cross-site cookies between `web.app` and `workers.dev` are not an acceptable session design.
4. Apply reviewed migrations to the supplied Supabase staging project and seed only after confirming it is empty and receiving explicit approval. Do not put database credentials, signing secrets, or demo OTP values in source control.
5. Configure Firebase Hosting and Cloudflare Worker bindings/secrets through the intended accounts. The Firebase CLI session must have access to `buyme-web-demo-20261119`; do not deploy to the unrelated Firebase project visible in the CLI account.

## Before provisioning

- Provision separate staging and production Supabase resources. Keep customer data out of staging.
- Decide the canonical web origin and configure TLS and origin validation for REST and real-time connections.
- Configure private storage for KYC and deposit slips, deny public access, restrict API IAM permissions, configure temporary-upload lifecycle deletion, and test signed upload/download URLs.
- Provide reachable ClamAV scanning; KYC submissions are expected to fail closed when scanning is unavailable.
- Select SMS and email providers and verify sender identity and delivery in Sri Lanka. Configure Firebase project credentials for push.
- Decide whether public OSM/OSRM endpoints are appropriate for the expected traffic. Production requires a contact email; public endpoints are not an availability commitment.
- Complete privacy, terms, retention, support, and incident-response review with qualified client/legal owners.

## Release sequence

1. Rerun dependency audits at release time. Current API, Admin web, and API contract npm audits report zero vulnerabilities; the CI audit job blocks on high findings. Flutter/Dart dependency audit remains outstanding.
2. Build from a reviewed commit using the CI pipeline. Do not deploy from an unverified workstation build.
3. Create isolated staging resources and configure secrets through provider secret managers. Do not apply the pending demo-account migration or seed until the target database is confirmed and approved.
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

No Firebase Hosting release, Supabase database connection, deployment secret, or functional application release has been configured or tested. The `buyme-api` bootstrap Worker is deployed at https://buyme-api.acceseries.workers.dev and its explicit 503 response was verified.
See [Client Accounts and External Access Blockers](./CLIENT_ACCOUNTS_AND_EXTERNAL_ACCESS.md) for the complete client-owned dependency list.
