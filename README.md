# BuyMe Supermarket Platform
### Multi-Store Grocery Delivery Platform — Batticaloa District, Sri Lanka
#### Multi-app grocery delivery frontend prototype

---

## Brand Visual Identity
- **Primary Neon Blue:** `#168BFF`
- **Deep Blue:** `#0866CC`
- **Ice White Canvas:** `#F7FAFF`
- **Soft Blue:** `#EAF3FF`
- **Light Glass Surface:** `rgba(255, 255, 255, 0.70)`
- **Dark Navy Typography:** `#10243B`
- **Headings & Numbers:** Manrope
- **Body:** DM Sans
- **Currency:** LKR (Sri Lankan Rupee)

---

## Directory Structure
- `design-system/`: Design tokens (`colors.json`, `typography.json`, `glassmorphism.json`, `spacing.json`), documentation, and live preview web app.
- `shared/`: Centralized local mock data (`stores.json`, `products.json`, `categories.json`, `riders.json`, `customers.json`, `orders.json`, `inventory.json`) and decoupled repository interfaces (TypeScript & Dart).
- `apps/`:
  - `customer_app/`: Customer Mobile App (Flutter)
  - `rider_app/`: Rider Operations Mobile App (Flutter)
  - `admin_app/`: Admin Mobile Management App (Flutter)
  - `admin_web/`: Admin Executive Web Dashboard (Next.js + TypeScript)
- `DEVELOPMENT_PROGRESS.md`: Phased development roadmap and sprint tracker.

---

## Viewing the Design System Preview
Open `design-system/preview/index.html` in any browser to inspect the interactive design system, live frosted glass cards, typography scale, and working local cart interactions.

## Deploying the Admin Web App
In Vercel, set the project root directory to `apps/admin_web`. The app uses Next.js static export; `npm run build` creates the deployable output in `out`.
