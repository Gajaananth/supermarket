# Client Accounts and External Access Blockers

**Status: no production account access was supplied or used.** These items require a client-owned account, decision, credential, or approval before the corresponding production work can be completed.

| Blocker | Client action required | Why / current status |
|---|---|---|
| Hosting and cloud | Provide the GCP project, region, Artifact Registry, Cloud Run service account and Secret Manager access; grant Firebase App Hosting and Cloudflare zone access | Google Cloud Run is selected for the API, Firebase App Hosting for web, and Cloudflare for DNS/WAF proxying; no cloud project or environment has been provisioned |
| PostgreSQL | Provision the client-owned Supabase PostgreSQL project/database, service owner, access policy, backup retention, and restore access | Supabase is planned, but no project or production DB was provisioned |
| Domain, DNS, and TLS | Provide the production domain, DNS access, certificate/termination plan, and approved API/web origins | No public domain or TLS endpoint is configured; the actual HTTPS origins still need to be added to the API allowlist and Cloudflare/Firebase configuration |
| SMS / OTP | For public staging demo accounts, provision a secret `DEMO_OTP_CODE` and enable the staging-only gate; before real users/production, create the approved SMS provider account, verify the Sri Lankan sender identity/route, and provide restricted credentials through a secret manager | Seeded demo identities can use the staging mock OTP. Real OTP and SMS notifications remain unavailable without provider credentials and local regulatory/provider approval |
| Email | Provide a verified sender and domain for the chosen email provider; configure SPF, DKIM, and DMARC; supply the API key securely | Email provider is not configured |
| Firebase | Create/identify separate staging and production Firebase projects, register Android application IDs, configure FCM, and provide service-account credentials securely | Push delivery and production app configuration are unverified |
| Private object storage | Select AWS S3 or a compatible service; provide a private bucket, least-privilege API IAM credentials, endpoint/region, upload CORS, lifecycle cleanup, and operational owner | KYC and deposit-slip storage is not live or verified |
| Malware scanning | Provide an isolated/reachable ClamAV service and network access from the API | KYC submission must remain fail-closed until scanner availability is proven |
| Google Play Console | Provide the client-owned developer account, verification, package identity, release owner, and protected signing process | No Play Console submission or production signing setup exists |
| Map/geocoding capacity | Provide an operations contact email for OSM usage and decide whether managed geocoding/routing capacity is required | Public endpoints are suitable only for constrained development use; traffic/availability needs an owner |
| Error tracking | Select an error-monitoring provider/account and approve SDK/data handling, retention, and alert recipients | No external error-tracking integration or alert routing is configured |
| Optional OneSignal | Decide whether OneSignal is required alongside Firebase, and if so provide a project and restricted credentials | Optional configuration exists; provider usage is not live-verified |
| Legal and privacy owners | Provide legal entity, privacy/support contacts, approved retention periods, and counsel review for privacy/terms and Play disclosures | The supplied policy/terms files are drafts only and not publishable |
| Release and incident owners | Name the approver for database migrations/releases, backup recovery, security incidents, and user notifications | No production change-control or escalation owner is recorded |

Never send account credentials in source control, chat, or this document. Use a client-controlled secret manager and grant only the access needed for the approved task.
