# Security Readiness Checklist

This is a repository-level readiness review, not a penetration test or a certification. A control marked implemented in code still requires deployment verification. No confirmed exploitable source-code vulnerability was established in the delegated review. Current npm lockfile audits report zero vulnerabilities; Flutter/Dart dependencies have not been audited.

| Area | Status | Evidence / remaining work |
|---|---|---|
| OWASP A01 — Broken access control | PARTIAL | JWT/RBAC guards and store ownership checks exist. API e2e includes cross-store/role cases, but the full API run had five failing order/cash-control tests; review authorization paths after those are fixed. |
| OWASP A02 — Cryptographic failures | PARTIAL | Admin passwords use Argon2; OTP and refresh tokens are stored hashed; separate JWT secrets are validated. Production TLS, secret-manager storage/rotation, database encryption, and provider key access are not deployed or verified. |
| OWASP A03 — Injection | PARTIAL | Nest validation pipes reject unknown fields and transform inputs; Prisma is the normal data-access layer. Current npm lockfile audits report zero vulnerabilities; no independent dynamic injection test was run. |
| OWASP A04 — Insecure design | BLOCKED | Order/stock/cash state machines and transaction-based reservation code exist. The full API suite has three failing order e2e tests; no order/store-alert load test was run. |
| OWASP A05 — Security misconfiguration | PARTIAL | REST and Socket.IO credentialed CORS now use the validated `CORS_ALLOWED_ORIGINS` exact-origin allowlist; localhost is rejected in production. Configure and verify the deployed origins. Security response headers/TLS ingress are not verified; no in-app Helmet configuration was found in the reviewed bootstrap. |
| OWASP A06 — Vulnerable and outdated components | PARTIAL | Current npm audits report zero vulnerabilities for API, API production dependencies, Admin web, and API contract after upgrades. Flutter/Dart package audit is not performed, and GitHub-hosted CI has not run. |
| OWASP A07 — Identification and authentication failures | PARTIAL | OTP attempt/rate controls, Argon2 admin login, short-lived JWTs, rotating refresh tokens, and reuse revocation are implemented. Auth and rider onboarding e2e pass with test OTP fixtures; production provider delivery and account recovery policy are not verified. |
| OWASP A08 — Software and data integrity failures | PARTIAL | Lockfiles and a GitHub Actions workflow are present; workflow syntax parses locally but GitHub-hosted CI has not run. No artifact signing, release provenance, or full Dart dependency audit is configured. |
| OWASP A09 — Security logging and monitoring failures | PARTIAL | Structured JSON logs and audit records exist. External error tracking, alert routing, PII-safe log review, and a retention schedule are not configured. |
| OWASP A10 — Server-side request forgery | NOT CONFIRMED | Map destinations are configured server-side; no SSRF exploit was confirmed in the review. Production egress policy and custom provider URL ownership still require deployment verification. |
| Upload validation and malware scanning | PARTIAL | API validates KYC/deposit upload constraints and KYC fails closed when ClamAV is unavailable. Actual private bucket IAM, CORS, lifecycle deletion, scanner isolation, and live storage flows are unverified; two cash-control upload e2e cases currently return 503. |
| Secrets in repository | CHECKED LOCALLY | A local signature-pattern scan was run without printing matched content. `.env.example` contains placeholders. This is not a guarantee against secrets in unscanned history or provider consoles; continue secret scanning in CI and rotate any exposed credential. |
| PII and data retention | BLOCKED | The model includes phone/email, address coordinates, rider GPS, KYC images, session metadata, order/COD, deposit-slip, and audit data. No approved retention/deletion schedule or live processor inventory exists; privacy policy is a draft. |
| Backups and recovery | PARTIAL | A disposable local PostgreSQL 18 dump/restore verified three rows. Production backup encryption, schedule, retention, recovery objective, and restore drill remain unverified. |

## Required before public launch

1. Configure and verify the CORS allowlist for deployed web origins through the actual ingress.
2. Run the Flutter/Dart dependency audit and execute the GitHub-hosted CI workflow; rerun npm audits at release time.
3. Investigate the five failing API e2e tests and rerun the complete suite.
4. Configure and test production TLS/security headers, secret management, private storage, malware scanning, provider delivery, backups, monitoring, and incident response.
5. Approve privacy/terms, data retention, user-data request handling, and Play Store disclosures.
6. Run a bounded load test against an isolated, seeded stack after functional e2e failures are resolved.
