# Operations Runbook

**Status: draft; no production service is currently monitored by this repository.**

## Health and startup

- API health endpoint: `GET /health` (outside the `/api/v1` prefix).
- Swagger UI is exposed at `/docs`; restrict access in production if API documentation is not intended to be public.
- Configuration is validated at API startup. Missing or invalid production settings should stop startup rather than be replaced with development defaults.
- Structured JSON application logs are implemented. An external error-tracking integration and alert routing are not configured.

## Routine checks

1. Review service health, request/error rates, database connection capacity, disk space, queue/job failures, and provider delivery failures.
2. Check overdue order processing and notification outbox state; investigate repeated failures rather than replaying blindly.
3. Confirm KYC malware scanning is reachable and private-bucket policy/lifecycle remains in effect.
4. Review backup completion and retention status; periodically restore into an isolated environment and verify representative rows.
5. Review audit records for privileged actions and investigate unexpected role, store, or deposit changes.

## Database backup and restore

- Use the selected PostgreSQL provider's documented encrypted backup mechanism and credentials. Do not put credentials in command history or logs.
- Before a migration or release, confirm the backup timestamp, target database identity, and successful completion.
- Restore only into an isolated database first; verify schema state and representative business records before any recovery decision.
- The local mechanics check completed against a disposable PostgreSQL 18 cluster on loopback: a custom-format dump was restored into a separate database and a three-row check returned `3:6`. The temporary cluster was stopped and removed. This does not verify a production backup, encryption, retention, or recovery point.
- Do not connect this procedure to Supabase or the unverified local PostgreSQL service without explicit target approval.

## Incident response

### Suspected credential or PII exposure

1. Notify the designated incident owner and preserve relevant logs without copying secrets or unnecessary personal data.
2. Restrict affected access; rotate provider/API credentials and revoke affected device sessions as appropriate.
3. Determine affected data types, users, time range, and processors. Do not delete evidence or make notification/legal claims before the responsible owner reviews them.
4. Record the incident, corrective actions, and required user/regulator notifications after legal review.

### API or database outage

1. Check `/health`, application logs, hosting status, database capacity, and recent release/migration records.
2. Avoid repeated restarts or unreviewed migrations. Roll back the application if the release is implicated and schema compatibility allows.
3. Escalate to the database/provider owner if restore is required; restore into isolation first.

### KYC upload or malware scanner outage

KYC submission is fail-closed when ClamAV cannot be reached. Do not bypass scanning. Restore the scanner/private-storage path, verify it with a harmless test file, and then ask users to retry.

### SMS, email, or push outage

Check provider status, credentials, sender verification, and persisted notification attempts. OTP delivery must not be replaced by returning codes outside local development. Do not replay all queued notifications until duplicate-delivery effects are understood.
