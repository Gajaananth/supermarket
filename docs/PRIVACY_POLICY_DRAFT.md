# Privacy Policy — Draft for Review

**Not for publication.** This draft describes implemented product data flows at a high level. The client must confirm actual providers, retention periods, legal bases, user rights workflows, contact details, and jurisdictional obligations with qualified counsel before publishing.

**Controller:** [Legal entity name and address]
**Privacy contact:** [Privacy email / phone]
**Effective date:** [Date]

## Information the service may process

- Account details such as phone number, email address, name, password hash for admin accounts, and OTP verification metadata.
- Device/session information such as device identifier, user agent, IP address, token/session state, and login timestamps.
- Order details, selected products, quantities, delivery address, service-area coordinates, order status, and COD collection records.
- Rider information including account and store assignment, bike details, driving/vehicle licence images, KYC decisions, and rider GPS/location updates associated with active operations.
- Deposit records, bank reference, deposit-slip image, verification status, and cash-ledger entries.
- Support, audit, security, and operational records created when users or administrators interact with the service.

## Purposes

The service uses this information to authenticate users, provide store-scoped catalogs and delivery, fulfill COD orders, allocate riders, review rider KYC, reconcile deposits, prevent abuse, maintain security/audit records, and provide support.

## Location, files, and notifications

Customer address coordinates are used for service-area/store matching and delivery. Rider location is used for dispatch and delivery operations; the app may request foreground or background location permissions for rider workflows. KYC documents and deposit slips are intended to be stored in private object storage and made available through short-lived authorized links. SMS, email, Firebase push, mapping, hosting, and storage processors may receive the minimum data needed for their configured service. The actual production processors are not yet selected or verified.

## Retention and deletion

**Retention periods are not yet approved or implemented as a complete policy.** The client must define periods for OTPs, device/session metadata, location history, KYC documents and temporary uploads, deposit slips/financial records, order history, audit logs, backups, and support records. Until approved, do not claim a specific deletion schedule. Provide a documented account-access, correction, export, and deletion request process and define legal/financial record exceptions.

## Security

The application uses authentication, role/store scoping, rate limits, audit records, hashed OTP/refresh-token storage, validated uploads, private signed URLs, and malware scanning for rider KYC. Security also depends on deployment controls that are not verified here, including TLS, database access, storage IAM and lifecycle policy, provider security, backups, and incident response.

## Children, international processing, and changes

[Client/legal review required: age eligibility, cross-border transfers, applicable Sri Lankan privacy requirements, complaint authority, and notice of material changes.]

## Contact and complaints

Contact [Privacy contact] to request access, correction, deletion, or raise a privacy concern. The client must provide a verified response and escalation process before publication.
