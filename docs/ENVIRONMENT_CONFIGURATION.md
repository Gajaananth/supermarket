# Environment Configuration

This guide describes configuration only; it does not provision infrastructure or authorize a database migration. Keep real values in each environment's secret manager. Commit `.env.example` placeholders only, never `.env` files, service-account JSON, signing keys, or credentials.

## Environment separation

| Environment | Purpose | Data and integrations |
|---|---|---|
| Development | Local feature work and isolated tests | Local/disposable PostgreSQL; OTP dev mode only on a developer machine; provider and storage test doubles where available |
| Staging | Release-candidate verification | Separate database, storage bucket, signing keys, SMS/email/push credentials, and test accounts; no production customer data |
| Production | Customer service | Managed PostgreSQL with tested backups, private object storage, reachable ClamAV, TLS ingress, and approved live provider accounts |

Never point development or staging at production data. Do not use the listening local PostgreSQL instance or Supabase for validation without explicit authorization. Apply reviewed migrations only to the intended target and only after a verified backup.

## API settings

Use [`apps/api/.env.example`](../apps/api/.env.example) as the authoritative variable list. The API validates configuration at startup.

| Setting group | Development | Staging / Production |
|---|---|---|
| Runtime | `NODE_ENV=development`; bind only to loopback where practical | `NODE_ENV=production`; private service network behind TLS ingress |
| CORS | Localhost origins are allowed by default for web development | Set `CORS_ALLOWED_ORIGINS` to a comma-separated list of exact HTTPS browser origins; production rejects localhost |
| Database | Disposable PostgreSQL URL | Dedicated, access-restricted PostgreSQL URL; enable provider-supported TLS and backups |
| JWT | Two different random secrets, each at least 32 characters | Two independent secret-manager values; rotate using a planned session invalidation procedure |
| OTP | `OTP_DEV_MODE=true` is permitted only on a local developer machine | `OTP_DEV_MODE=false`; configure an approved SMS provider and verified email sender |
| Uploads | Local product-image directory; private-storage test double if needed | Private S3-compatible bucket, narrowly scoped IAM, upload CORS, lifecycle cleanup, and a reachable ClamAV scanner; fail closed if scanning is unavailable |
| Notifications | Provider test doubles or explicitly configured development credentials | Separate production Firebase, SMS, and email credentials; verify delivery and failure alerting before launch |
| Maps | Public OSM endpoints only for low-volume development and with a contact email | HTTPS endpoints, required `OSM_CONTACT_EMAIL`, minimum one-second Nominatim interval; arrange managed capacity before material traffic |
| Limits | Non-production limits appropriate for local tests | Set documented API and socket limits for expected traffic; both request throttling and socket event limits are process-local and are not cluster-wide |

Production startup validation currently rejects development OTP mode, localhost CORS origins, missing Firebase/SMS/email configuration, missing OSM contact email, insecure OSM URLs, and missing private-storage/ClamAV configuration. It does not configure hosting, TLS, backups, or an external error-tracking service.

## Web and Android clients

- Configure the Admin web app against the intended API/BFF origin without embedding credentials or privileged API keys in `NEXT_PUBLIC_*` variables.
- Build Android releases with production API endpoints supplied through the approved build/release process. The current default emulator URL is for development only.
- Keep Firebase service credentials and Android signing material in a secret manager or protected release system. Do not commit `google-services.json` if it contains project credentials unless the project's security policy explicitly approves it.
- Staging and production must use separate Firebase projects, application IDs, and push credentials.

## Secret handling checklist

1. Copy `.env.example` to an ignored local `.env` only for local development.
2. Generate independent, high-entropy access-token and refresh-token secrets.
3. Store deployed secrets in the chosen hosting provider's secret manager; restrict read access and audit changes.
4. Rotate credentials after suspected exposure and revoke affected sessions/provider keys.
5. Confirm `git status` and a secret scan before publishing; do not paste secret values into logs, tickets, or chat.
