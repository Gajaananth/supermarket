# BuyMe Batticaloa — Public Web Demo & Client Guide

This document contains the deployment instructions, demo personas, and a structured 10-step client walkthrough for the **BuyMe** multi-store hyperlocal grocery delivery platform (Batticaloa District, Sri Lanka).

---

## 1. Quick Free Deployment (Get Public URL in < 60s)

The entire static web app is compiled into HTML/CSS/JS in `apps/admin_web/out`.

### Option A: Netlify Drop (Zero Installation, Drag-and-Drop) — Recommended
1. Open your browser and go to **[https://app.netlify.com/drop](https://app.netlify.com/drop)**.
2. From the repository root, drag and drop the `apps/admin_web/out` folder directly onto the browser window.
3. Netlify will upload and provide your live HTTPS link instantly (e.g., `https://buyme-batticaloa.netlify.app`).

### Option B: Netlify CLI (One PowerShell Command)
Run this command from the repository root:
```powershell
cd apps\admin_web
npx netlify-cli deploy --dir=out --prod
```
*Follow the interactive prompt to create a new site. It completes in ~15 seconds and prints the live public URL.*

### Option C: Vercel CLI (One PowerShell Command)
```powershell
cd apps\admin_web
npx vercel --prod
```

> **Direct Links & Refresh Verification**: Because `trailingSlash: true` is enabled in `next.config.js`, every route is exported as an `index.html` file inside its route directory (e.g., `out/admin/orders/index.html`). Direct links like `/admin/orders/` and browser refreshes work immediately on free hosts with zero 404 errors. `public/_redirects` is also bundled.

---

## 2. Demo Persona Accounts (1-Click Login)

Navigate to `/login` to access the 1-click persona switchers. No passwords required:

| Persona | Role | Default Name / Details | Target Access Route |
|---|---|---|---|
| **Main HQ Admin** | `main_admin` | HQ Operations Director | `/admin/overview` (Full access to all 12 Admin Hubs) |
| **Store Admin** | `store_admin` | Store Manager (`BM-S01` Puliyanthivu) | `/admin/overview` (Store-scoped stock, order dispatch) |
| **Rider Courier** | `rider` | Kajan Sivanesan (`RDR-001`, TVS Raider `EP BDF-4821`) | `/rider` (Shift dashboard, COD collection, LKR 10,000 meter) |
| **Customer** | `customer` | Ananya S. (Puliyanthivu, Batticaloa) | `/shop` (Storefront, cart, COD checkout, `/shop/account`) |

---

## 3. 10-Step Client Click-Through Script

Follow these 10 steps to demonstrate the end-to-end functionality to clients:

1. **Platform Hub (`/`)**:
   Open the home page. Review the 4 platform cards: Customer Storefront, Rider Operations, Executive Admin, and Design System Preview.
2. **Customer Storefront (`/shop`)**:
   Click "Launch Storefront". Notice the 10 Batticaloa store hubs selector (`BM-S01` Batticaloa Town / Puliyanthivu, `BM-S02` Kattankudy, etc.).
3. **Category & Product Catalog**:
   Filter products by 8 local categories: Rice & Grains, Lagoon Seafood, Fresh Produce, Dairy, Spices, Bakery, Beverages, and Household Essentials. Add items to cart.
4. **Route Guard Security Check (Unauthenticated)**:
   In the browser address bar, directly navigate to `/admin/orders` without signing in. Notice the immediate security redirect to `/login?redirect=/admin/overview`.
5. **1-Click Executive Login**:
   On `/login`, click the red **Main HQ Admin** demo button. You are instantly authenticated and redirected to `/admin/overview`.
6. **Executive Dashboard & Vector Charts**:
   On `/admin/overview`, observe the 8 KPI metric cards across 10 stores (LKR 59,130 Revenue, 22 Orders, 14/15 Active Riders). Review the **Weekly Revenue Performance Area Chart** and **Order Status Breakdown Donut Chart** (both rendered via 100% responsive SVG vectors on desktop and mobile).
7. **Real-Time Orders Management (`/admin/orders`)**:
   Open the Orders Stream. Filter across 22 simulated orders using status tabs (*All*, *Pending*, *Out for Delivery*, *Delivered*). Click the eye icon on any order to view the full order breakdown drawer.
8. **10 Hyperlocal Store Network (`/admin/stores`)**:
   View all 10 Batticaloa District store hubs (`BM-S01` to `BM-S10`), coverage radiuses (7-10 km), operational hours, and active store status toggles.
9. **Rider Operations Portal (`/rider`)**:
   Sign out from the top navigation and click the **Rider Courier** button on `/login`. Review the live rider shift view, doorstep COD collection tracker, and the **LKR 10,000 Cash-in-Hand Safety Threshold Meter**.
10. **Role Protection & Reset Demo Data**:
    While logged in as a Rider, try opening `/admin/orders`. Confirm that the 403 `/unauthorized` screen blocks access. Finally, click the **"Reset demo data"** button in the persistent amber demo banner to reset the session.
