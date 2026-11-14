# BuyMe — Comprehensive Frontend Page & Screen Audit
**Platform:** BuyMe Supermarket Ecosystem • Batticaloa District, Sri Lanka  
**Theme:** Red (`#E4002B`) + White (`#FFFDFD`) + Accent Yellow (`#FFC20E`) Glassmorphism  
**Audit Baseline:** Honest Status Tracking — unbuilt screens marked NOT STARTED.

---

## 1. Executive Summary

| Application | Target Architecture | Total Required Pages | Completed Real Routes | Audit Status |
| :--- | :--- | :--- | :--- | :--- |
| **Admin & Customer Web Shell** | Next.js App Router | 5+ Core Routes | 0 (Legacy tab switcher) | **NOT STARTED (Step 4)** |
| **Customer Android App** | Flutter (GoRouter + Riverpod) | 30+ Screens | 0 | **NOT STARTED** |
| **Rider Android App** | Flutter (GoRouter + Riverpod) | 20+ Screens | 0 | **NOT STARTED** |
| **Admin Mobile App** | Flutter (GoRouter + Riverpod) | 22+ Screens | 0 | **NOT STARTED** |
| **Design Preview (Web)** | Next.js Route (`/design-preview`) | 1 | 1 (Requires Red Re-theme) | **IN PROGRESS** |

---

## 2. Web Portal Pages (`apps/admin_web` / `apps/web`)

| Route | Purpose | Intended Role | Current Status |
| :--- | :--- | :--- | :--- |
| `/login` | Multi-role authentication (Admin / Rider / Customer) | Public | **NOT STARTED** |
| `/shop` | Customer online storefront & catalog | Customer / Public | **NOT STARTED** |
| `/rider` | Rider active delivery & COD cash status portal | Rider | **NOT STARTED** |
| `/admin` | Main & Store Admin management dashboard | Admin | **NOT STARTED** |
| `/design-preview` | Design system component showcase | Internal / Review | **IN PROGRESS** |

---

## 3. Customer Android App (`apps/customer_app`)

| Screen / Feature | Route Name | File Target | Status |
| :--- | :--- | :--- | :--- |
| Splash Screen | `/splash` | `lib/features/auth/screens/splash_screen.dart` | **NOT STARTED** |
| Onboarding | `/onboarding` | `lib/features/auth/screens/onboarding_screen.dart` | **NOT STARTED** |
| Customer Login | `/login` | `lib/features/auth/screens/login_screen.dart` | **NOT STARTED** |
| Registration | `/register` | `lib/features/auth/screens/register_screen.dart` | **NOT STARTED** |
| Forgot Password | `/forgot-password` | `lib/features/auth/screens/forgot_password_screen.dart` | **NOT STARTED** |
| OTP Verification | `/otp` | `lib/features/auth/screens/otp_screen.dart` | **NOT STARTED** |
| Reset Password | `/reset-password` | `lib/features/auth/screens/reset_password_screen.dart` | **NOT STARTED** |
| Home / Storefront | `/home` | `lib/features/shop/screens/home_screen.dart` | **NOT STARTED** |
| Search | `/search` | `lib/features/shop/screens/search_screen.dart` | **NOT STARTED** |
| Search Results | `/search/results` | `lib/features/shop/screens/search_results_screen.dart` | **NOT STARTED** |
| Category List | `/categories` | `lib/features/shop/screens/category_list_screen.dart` | **NOT STARTED** |
| Product List | `/products` | `lib/features/shop/screens/product_list_screen.dart` | **NOT STARTED** |
| Product Details | `/product/:id` | `lib/features/shop/screens/product_details_screen.dart` | **NOT STARTED** |
| Shopping Cart | `/cart` | `lib/features/cart/screens/cart_screen.dart` | **NOT STARTED** |
| Store Selector | `/store-select` | `lib/features/checkout/screens/store_select_screen.dart` | **NOT STARTED** |
| Address Selection | `/address-select` | `lib/features/checkout/screens/address_select_screen.dart` | **NOT STARTED** |
| Add Address | `/address/add` | `lib/features/checkout/screens/add_address_screen.dart` | **NOT STARTED** |
| Checkout | `/checkout` | `lib/features/checkout/screens/checkout_screen.dart` | **NOT STARTED** |
| Order Confirmation | `/order-confirmation`| `lib/features/checkout/screens/order_confirmation_screen.dart` | **NOT STARTED** |
| Order Tracking | `/order-tracking/:id`| `lib/features/orders/screens/order_tracking_screen.dart` | **NOT STARTED** |
| Order History | `/orders` | `lib/features/orders/screens/order_history_screen.dart` | **NOT STARTED** |
| Order Details | `/orders/:id` | `lib/features/orders/screens/order_details_screen.dart` | **NOT STARTED** |
| Customer Profile | `/profile` | `lib/features/profile/screens/profile_screen.dart` | **NOT STARTED** |
| Language Settings | `/settings/language` | `lib/features/profile/screens/language_screen.dart` | **NOT STARTED** |

---

## 4. Rider Android App (`apps/rider_app`)

| Screen / Feature | Route Name | File Target | Status |
| :--- | :--- | :--- | :--- |
| Splash Screen | `/splash` | `lib/features/auth/screens/splash_screen.dart` | **NOT STARTED** |
| Rider Login | `/login` | `lib/features/auth/screens/login_screen.dart` | **NOT STARTED** |
| Rider Dashboard | `/dashboard` | `lib/features/dashboard/screens/rider_dashboard_screen.dart` | **NOT STARTED** |
| Delivery Dispatch Sheet | `/dispatch/:id` | `lib/features/delivery/screens/dispatch_detail_screen.dart` | **NOT STARTED** |
| Active Navigation Map | `/deliver/navigate` | `lib/features/delivery/screens/delivery_map_screen.dart` | **NOT STARTED** |
| COD Cash Collection | `/deliver/cod` | `lib/features/delivery/screens/cod_collection_screen.dart` | **NOT STARTED** |
| Cash In Hand Meter | `/cash/status` | `lib/features/cash/screens/cash_meter_screen.dart` | **NOT STARTED** |
| Deposit Request & Slip | `/cash/deposit` | `lib/features/cash/screens/deposit_slip_screen.dart` | **NOT STARTED** |
| Rider Shift History | `/history` | `lib/features/history/screens/shift_history_screen.dart` | **NOT STARTED** |
| Rider Profile | `/profile` | `lib/features/profile/screens/rider_profile_screen.dart` | **NOT STARTED** |

---

## 5. Admin Mobile App (`apps/admin_app`)

| Screen / Feature | Route Name | File Target | Status |
| :--- | :--- | :--- | :--- |
| Splash Screen | `/splash` | `lib/features/auth/screens/splash_screen.dart` | **NOT STARTED** |
| Admin Login | `/login` | `lib/features/auth/screens/login_screen.dart` | **NOT STARTED** |
| Multi-Store Overview | `/overview` | `lib/features/overview/screens/overview_screen.dart` | **NOT STARTED** |
| Store Selector | `/stores` | `lib/features/stores/screens/store_list_screen.dart` | **NOT STARTED** |
| Store Inventory Matrix | `/inventory` | `lib/features/inventory/screens/inventory_screen.dart` | **NOT STARTED** |
| Stock Adjustment | `/inventory/adjust` | `lib/features/inventory/screens/stock_adjust_screen.dart` | **NOT STARTED** |
| Order Stream | `/orders` | `lib/features/orders/screens/admin_orders_screen.dart` | **NOT STARTED** |
| Rider Fleet & Cash Control | `/riders/cash` | `lib/features/cash/screens/admin_cash_control_screen.dart` | **NOT STARTED** |
| Deposit Verification Queue | `/cash/verify` | `lib/features/cash/screens/deposit_verify_screen.dart` | **NOT STARTED** |
