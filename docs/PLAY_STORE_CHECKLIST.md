# Google Play Release Checklist

**Status: NOT READY FOR SUBMISSION.** No Play Console account, production signing setup, final package identity, privacy-policy URL, or production Firebase project has been verified.

## Account and app setup

- [ ] Client-owned Play Console account and organization/developer verification completed.
- [ ] Confirm final app names, package IDs, ownership, store listings, support contacts, and release country/regions.
- [ ] Confirm current Play target API level, Android policy requirements, and account-specific testing requirements at release time.
- [ ] Configure protected upload/release signing and recovery; never commit keystores or passwords.
- [ ] Use separate staging/production application IDs and Firebase projects where appropriate.

## Privacy, safety, and permissions

- [ ] Publish a reviewed privacy policy at a stable HTTPS URL and link it from each listing.
- [ ] Complete Data safety declarations accurately for phone/email, device/session identifiers, addresses, order history, rider location, KYC images, deposit slips, and third-party processors.
- [ ] Complete account deletion and user-data request flows required by current Play policy.
- [ ] Explain location usage before permission prompts. Justify and document background location only for the rider feature that needs it; submit any required Play declaration and demonstration video.
- [ ] Verify camera/photo/file access declarations and least-privilege selection for rider KYC and deposit slips.
- [ ] Verify notification permission behavior and that core order workflows remain understandable when notifications are denied.
- [ ] Complete content rating, target audience, ads declaration, app-access instructions, and store listing disclosures.

## Build and testing

- [ ] Build production APK/AAB with the approved API origin and no development OTP mode.
- [ ] Verify the production build on supported physical devices and Android versions; test low connectivity, permission denial, logout, and account deletion.
- [ ] Test OTP, store matching, COD checkout, rider KYC/upload/review, location behavior, notification delivery, and deposit-slip workflows against staging.
- [ ] Capture current screenshots, icon, feature graphic, and localized English/Tamil listing content.
- [ ] Release to internal testing, collect crash/ANR and user feedback, then complete closed/open testing requirements applicable to the account.
- [ ] Confirm dependency audit, security review decisions, privacy/terms approval, and backup/incident readiness before production rollout.
