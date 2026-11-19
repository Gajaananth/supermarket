# BuyMe — Comprehensive Frontend Page & Screen Audit
**Platform:** BuyMe Supermarket Ecosystem • Batticaloa District, Sri Lanka  
**Theme:** Red (`#E4002B`) + White (`#FFFDFD`) + Accent Yellow (`#FFC20E`) Glassmorphism  
**Audit Baseline:** Updated on 2026-11-18. Super Admin Gate (a) is approved; Store Admin Gate (b) implementation and authenticated browser workflows are verified against a disposable local test schema and await user approval. Customer and Rider Android Gates are approved; Admin Android is implemented and awaits gate approval. UI presence does not imply end-to-end verification outside the rows explicitly verified below.

---

## 1. Executive Summary

| Application | Target Architecture | Total Required Pages | Source Page Routes | Audit Status |
| :--- | :--- | :--- | :--- | :--- |
| **Admin & Customer Web Platform** | Next.js 16 App Router, Tailwind CSS 4, API BFF | 20 Routes | 20 | **Super Admin Gate (a) approved; Store Admin Gate (b) verified, awaiting approval** |
| **Customer Android App** | Flutter (GoRouter + Riverpod) | 10 Screens | 10 | **Customer Gate approved** |
| **Rider Android App** | Flutter (GoRouter + Riverpod) | 6 Screens | 6 | **Rider Gate approved** |
| **Admin Mobile App** | Flutter (GoRouter + Riverpod) | 9 Routes | 9 | **IMPLEMENTED; Admin Android Gate awaiting approval** |
| **Design Preview (Web)** | Next.js Route (`/design-preview`) | 1 | 1 | **UI PRESENT** |

---

## 2. Web Portal Pages (`apps/admin_web`)

| Route | Purpose | Intended Role | Current Status |
| :--- | :--- | :--- | :--- |
| `/` | Customer-facing landing page | Public | **UI PRESENT** |
| `/login` | Super Admin email/password and optional 2FA login | Public | **IMPLEMENTED; browser-rendered at 390/768/1440/1920 px; auth flow not verified** |
| `/shop` | Customer storefront, location, catalogue, COD | Customer / Public | **NOT STARTED; route gated** |
| `/shop/account` | Customer profile, address selection, order history | Customer | **NOT STARTED; route gated** |
| `/rider` | Rider portal, deliveries and cash control | Rider | **NOT STARTED; route gated** |
| `/admin` | Super Admin landing/redirect | Super Admin | **PROTECTED; Gate (a)** |
| `/admin/overview` | Live KPI dashboard and reports summary | Super Admin | **API-BACKED; authenticated browser flow unverified** |
| `/admin/orders` | Store order operations | Store Admin | **API-BACKED; Gate (b) browser workflow verified** |
| `/admin/stores` | Store directory and active status | Super Admin | **API-BACKED; authenticated browser flow unverified** |
| `/admin/riders` | Rider KYC review, approval/assignment and rejection | Super Admin | **API-BACKED; authenticated browser flow unverified** |
| `/admin/products` | Product and category administration | Admin | **NOT STARTED in web Gate (a)** |
| `/admin/categories` | Category administration | Admin | **NOT STARTED in web Gate (a)** |
| `/admin/inventory` | Main warehouse stock, barcode/search and low-stock view | Super Admin | **API-BACKED; authenticated browser flow unverified** |
| `/admin/transfers` | Stock transfer dispatch, receipt and discrepancy handling | Super Admin / Store Admin | **Super Admin API-backed; Store Admin partial receipt and discrepancy flow verified** |
| `/admin/store-stock` | Assigned-store stock, alerts and adjustments | Store Admin | **API-BACKED; browser scope, alert, and adjustment flows verified** |
| `/admin/deposits` | Rider deposit slip review and verification | Store Admin | **API-BACKED; deposit approval flow verified** |
| `/admin/customers` | Customer accounts and order history | Admin | **NOT STARTED in web Gate (a)** |
| `/admin/deliveries` | Delivery dispatch operations | Admin | **NOT STARTED in web Gate (a)** |
| `/admin/reports` | Date/store-filtered sales reporting | Super Admin | **API-BACKED; authenticated browser flow unverified** |
| `/admin/notifications` | Real-time dispatch alerts | Admin | **NOT STARTED in web Gate (a)** |
| `/admin/settings` | Store preferences and operational limits | Admin | **NOT STARTED in web Gate (a)** |
| `/unauthorized` | 403 Forbidden RBAC security guard page | All | **UI PRESENT** |
| `not-found` | 404 Route handler | Public | **UI PRESENT** |
| `/design-preview` | Design system component showcase | Internal / Review | **UI PRESENT** |

### Gate (a) verification notes

- `npm run typecheck` and `npm run build` pass in `apps/admin_web`.
- API TypeScript build passes; focused unit tests pass (3 files, 13 tests).
- A disposable Super Admin account successfully logged in; its profile and live API data rendered in the browser. Refresh rotated both HttpOnly tokens, and logout-all prevented a second device from refreshing (HTTP 401).
- The six Gate (a) pages passed across 390, 768, 1024, 1440, and 1920 px (30/30 page/viewport checks, no horizontal overflow or page alerts). Inventory barcode search and its no-results state passed.
- Real authenticated overview screenshots were captured at 390, 768, 1440, and 1920 px. The rider queue numeric query returned page 1/pageSize 25 from the API.
- Tests and screenshots used an isolated PostgreSQL schema with a temporary seed account; the schema was dropped after verification. No populated local or Supabase schema was changed.
- Gate (a) is approved. Gate (b) is verified and awaits user approval before work proceeds to Gate (c).

### Gate (b) Store Admin verification notes

- Store Admin session and role-scoped navigation were verified. A Store Admin request to another store's stock returned HTTP 403, and navigation to a Super Admin-only route redirected to Store Admin orders.
- Orders were exercised through accept, preparation, ready, and eligible-rider assignment. Polling displayed a new order and its alert; browser/audio alerts were enabled through the page control.
- Store stock alert acknowledgment and a +5 adjustment succeeded. Receiving 4 of 5 transferred units recorded a partial receipt and discrepancy. Deposit approval cleared the verification queue.
- Orders, store stock, incoming transfers, and deposit verification passed at 390, 768, 1024, 1440, and 1920 px (20/20 route/viewport checks; no horizontal overflow).
- Real order-page screenshots were captured at 390, 768, 1440, and 1920 px. Frontend typecheck and production build pass; Orders/COD e2e passes (10/10).
- Security dependency remediation migrated the Admin web CSS pipeline to Tailwind 4. Current typecheck and production build pass; responsive screenshots have not been recaptured after that tooling change.
- Verification used a disposable PostgreSQL schema and temporary Store Admin/rider test records. Gate (b) is verified and awaits user approval before Gate (c).

---

## 3. Customer Android App (`apps/customer_app`)

| Screen / Feature | Route Name | File Target | Status |
| :--- | :--- | :--- | :--- |
| Location and nearest-open-store selection | `/location` | `lib/features/location/presentation/location_screen.dart` | **IMPLEMENTED; APK builds passed** |
| Customer phone OTP login and session refresh | `/login` | `lib/features/auth/presentation/login_screen.dart` | **IMPLEMENTED; API e2e not run** |
| Storefront, product search, and add-to-cart | `/shop` | `lib/features/catalog/presentation/shop_screen.dart` | **IMPLEMENTED; API e2e not run** |
| Store categories | `/categories` | `lib/features/catalog/presentation/categories_screen.dart` | **IMPLEMENTED; API e2e not run** |
| Cart and quantity management | `/cart` | `lib/features/cart/presentation/cart_screen.dart` | **IMPLEMENTED; API e2e not run** |
| Saved delivery addresses | `/addresses` | `lib/features/addresses/presentation/addresses_screen.dart` | **IMPLEMENTED; API e2e not run** |
| COD checkout and reservation-backed order placement | `/checkout` | `lib/features/checkout/presentation/checkout_screen.dart` | **IMPLEMENTED; API e2e not run** |
| Customer order history | `/orders` | `lib/features/orders/presentation/orders_screen.dart` | **IMPLEMENTED; API e2e not run** |
| OSM route preview, order status and rider location | `/tracking/:orderId` | `lib/features/orders/presentation/order_tracking_screen.dart` | **IMPLEMENTED; Socket.IO/live provider unverified** |
| Profile, address access, sign-out and push configuration status | `/profile` | `lib/features/profile/presentation/profile_screen.dart` | **IMPLEMENTED; Firebase unconfigured** |

### Customer Gate verification

- Uses the shared `buyme_design` tokens/widgets, Riverpod providers, GoRouter, a generated OpenAPI/Chopper client, secure token storage, OSM maps, and authenticated order-room Socket.IO updates.
- `flutter analyze`: no issues found. `flutter test`: all 4 tests passed.
- Debug APK build passed: `apps/customer_app/build/app/outputs/flutter-apk/app-debug.apk` (169,030,894 bytes). Standard `flutter build apk` release build passed: `apps/customer_app/build/app/outputs/flutter-apk/app-release.apk` (58,929,087 bytes), with `BUYME_API_BASE_URL=http://10.0.2.2:4000`. The release artifact uses debug signing and an emulator API URL; it is not production-ready.
- No Android device/emulator was connected, so neither APK was launched. Customer Gate is approved; Rider is implemented and awaits approval, while Admin Mobile remains not started.
- The Customer app's `ios/` and `web/` folders and the old mock/local-data screens were removed. The Rider app is Android-only; Admin Mobile remains untouched.
- Firebase options and native project configuration are not present, so push delivery is explicitly unavailable until configured. No credentials were fabricated or committed.
- API Orders/address e2e is **NOT RUN**: the configured local PostgreSQL port 5433 is not listening; a disposable-schema attempt on local port 5432 was denied at database permissions before schema creation. No Supabase/public schema was touched. Live API, map providers, and Socket.IO were not run from an emulator.

---

## 4. Rider Android App (`apps/rider_app`)

| Screen / Feature | Route Name | File Target | Status |
| :--- | :--- | :--- | :--- |
| Rider phone OTP login and secure session | `/login` | `lib/features/auth/presentation/login_screen.dart` | **IMPLEMENTED; live API unverified** |
| Dashboard, assigned orders, and shift controls | `/` | `lib/features/home/presentation/rider_home_screen.dart` | **IMPLEMENTED; shift e2e blocked by unavailable local PostgreSQL** |
| KYC camera capture, upload, status, and resubmission | `/kyc` | `lib/features/kyc/presentation/kyc_screen.dart` | **IMPLEMENTED; live storage/ClamAV unverified** |
| Order acceptance/rejection, OSM navigation, COD delivery, and location sharing | `/delivery/:orderId` | `lib/features/delivery/presentation/delivery_screen.dart` | **IMPLEMENTED; device/live API unverified** |
| Cash balance, deposit slip upload, and deposit history | `/cash` | `lib/features/cash/presentation/cash_screen.dart` | **IMPLEMENTED; live storage unverified** |
| Rider profile and logout | `/profile` | `lib/features/profile/presentation/rider_profile_screen.dart` | **IMPLEMENTED** |

### Rider Gate verification

- Uses shared `buyme_design`, Riverpod, GoRouter, the generated OpenAPI/Chopper client, secure token storage, OSM maps, and authenticated Socket.IO location updates. Android foreground location sampling is configured for 100 m / 60 seconds with a background-location permission flow.
- KYC and deposit slips use signed private-storage upload URLs; rider eligibility and shift start/stop are backed by API endpoints.
- `flutter analyze`: no issues. `flutter test`: all 4 tests passed. API `npm run build` passed.
- `flutter build apk` passed: `apps/rider_app/build/app/outputs/flutter-apk/app-release.apk` (58,713,787 bytes). This default release build targets the emulator API URL and is not production-ready; Gradle emitted non-fatal Kotlin-plugin and Java 8 deprecation warnings.
- `adb devices` showed no connected device/emulator, so the APK was not launched. Firebase credentials and live API, storage, messaging, and location behavior remain unverified.
- Rider onboarding/shift API e2e is **NOT RUN**: the runner could not reach local PostgreSQL at `localhost:5433`. No external or Supabase database was used.

---

## 5. Admin Mobile App (`apps/admin_app`)

| Screen / Feature | Route Name | File Target | Status |
| :--- | :--- | :--- | :--- |
| Admin sign-in and optional Super Admin 2FA | `/login` | `lib/features/auth/presentation/login_screen.dart` | **IMPLEMENTED; live auth not exercised** |
| Operations dashboard | `/admin` | `lib/features/home/presentation/admin_home_screen.dart` | **API-BACKED; live API not exercised** |
| Store order queue and lifecycle actions | `/admin/orders` | `lib/features/orders/presentation/orders_screen.dart` | **API-BACKED; live API not exercised** |
| Store stock search, adjustments, and low-stock alerts | `/admin/inventory` | `lib/features/inventory/presentation/inventory_screen.dart` | **API-BACKED; live API not exercised** |
| Transfer create, dispatch, receipt, discrepancy resolution, revert, and cancel | `/admin/transfers` | `lib/features/transfers/presentation/transfers_screen.dart` | **API-BACKED; live API not exercised** |
| Operations menu | `/admin/more` | `lib/features/more/presentation/more_screen.dart` | **IMPLEMENTED** |
| Deposit slip review, approval/rejection, and variance resolution | `/admin/more/deposits` | `lib/features/deposits/presentation/deposits_screen.dart` | **API-BACKED; live storage/API not exercised** |
| Store directory and approximate OSM locations | `/admin/more/stores` | `lib/features/stores/presentation/stores_screen.dart` | **API-BACKED; map tiles not exercised on device** |
| Rider KYC documents, approval/assignment, and rejection | `/admin/more/riders` | `lib/features/riders/presentation/riders_screen.dart` | **Super Admin only; signed URLs/live storage not exercised** |

### Admin Android Gate verification

- Android-only Flutter app uses GoRouter, Riverpod, the generated OpenAPI/Chopper client, secure token storage, optional Firebase push setup, shared BuyMe design tokens, and OSM map tiles.
- `flutter analyze`: no issues found. `flutter test`: all 3 focused model tests passed.
- `flutter build apk --release --no-pub` succeeded: `apps/admin_app/build/app/outputs/flutter-apk/app-release.apk` (58,031,234 bytes). The first Gradle attempt failed because Kotlin incremental-cache paths spanned D: and E:; disabling Kotlin incremental compilation allowed the build to pass. Gradle also emitted a non-fatal Firebase Kotlin Gradle Plugin compatibility warning.
- `adb devices` returned no connected device/emulator, so the APK was not launched. The default API URL points to the Android emulator (`http://10.0.2.2:4000`); API/database, Firebase push, OSM tile rendering, and private document/slip flows remain unverified. Store settings, full rider fleet/suspension management, and live reporting are not surfaced in this mobile iteration.
- Super Admin and Store Admin API access remains server-scoped. The app restricts rider review to Super Admin and eligible-rider assignment UI to Store Admin; the backend remains authoritative for all mutations.
- Admin Android Gate is implemented and awaiting user approval. No later mobile work has started.

## Production Readiness Status

- No frontend screens or styles were changed during the security/readiness work; browser, responsive-layout, and screenshot checks were not rerun for this task.
- Previously verified Super Admin and Store Admin web gates retain their recorded evidence above. Customer storefront and Rider web portal remain **NOT STARTED**.
- Public deployment remains blocked pending an explicit API CORS allowlist, production provider/storage configuration, and dependency-advisory decisions. The Play Store release checklist is documented but not complete.
