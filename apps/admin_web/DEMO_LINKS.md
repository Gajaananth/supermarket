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
| **Rider Courier** | `rider` | Kajan Sivanesan (`rdr-01`, TVS Raider `EP BDF-4821`) | `/rider` (Shift dashboard, COD collection, LKR 10,000 meter) |
| **Customer** | `customer` | Ananya S. (Puliyanthivu, Batticaloa) | `/shop` (Storefront, cart, COD checkout, `/shop/account`) |

---

## 3. 10-Step Interactive Client Walkthrough (Core Demos A–D)

Follow these 10 steps to demonstrate the complete end-to-end multi-party workflow to clients:

### Step 1: Customer Storefront & Hyperlocal Catalog (`/shop`)
- Open `/shop`. Note the 10 Batticaloa District store hubs (`BM-S01` Puliyanthivu, `BM-S02` Kattankudy, `BM-S03` Eravur, etc.).
- Browse items across categories (Lagoon Seafood, Rice & Grains, Fresh Produce, Dairy).
- Add items to the basket (e.g. Lagoon Prawns and Keeri Samba Rice).

### Step 2: Delivery Zone Calculation & Free Delivery Threshold (Core Demo A)
- Open the sliding basket drawer.
- Select different delivery zones to see dynamic delivery fee calculations:
  - *Zone 1: Puliyanthivu & Central Batticaloa* (LKR 200)
  - *Zone 2: Kallady & Urani* (LKR 250)
  - *Zone 3: Kattankudy Hub Area* (LKR 300)
  - *Zone 4: Eravur & Chenkalady* (LKR 400)
  - *Zone 5: Valaiyiravu & Outskirts* (LKR 550)
- Adjust basket quantity above **LKR 5,000**: notice the progress meter unlock **FREE Delivery** (Delivery fee becomes LKR 0).
- Confirm that payment is strictly **Cash on Delivery (COD)**.

### Step 3: COD Order Placement & Real-Time Sync
- Click **"Place Cash on Delivery Order"**.
- View the animated order confirmation modal with order reference (e.g. `ORD-2026-XXXX`).
- The order is automatically broadcast and saved to shared local state as `"placed"`.

### Step 4: Admin Security & Route Guards
- Directly type `/admin/orders` into the browser URL without an active admin session.
- Verify that the route guard immediately redirects to `/login?redirect=/admin/orders`.
- On `/login`, click the red **Main HQ Admin** 1-click demo button.

### Step 5: Admin Overview & Vector Analytics (`/admin/overview`)
- View the executive dashboard showing accurate Batticaloa KPIs across 10 active stores.
- Review the responsive **Weekly Revenue Area Chart** and **Order Status Donut Chart** (rendered with 100% SVG vectors on both desktop and 390px mobile).

### Step 6: Admin Orders Stream & Newly Placed Order (`/admin/orders`)
- Navigate to `/admin/orders`.
- The customer's newly placed order appears at the top of the list with the blue **"placed"** status badge.
- Click **"Assign Rider"** on the order.

### Step 7: Store-Isolated Rider Assignment & Locked Status Reasons (Core Demo B)
- In the Rider Assignment modal, notice:
  - Only riders stationed at that order's store hub are displayed (strict store hub isolation).
  - **Locked Riders** are greyed out with clear lock reasons:
    - *rdr-01 (Kajan Sivanesan)*: `Locked: Deposit pending Store Admin verification` / `Cash limit exceeded (LKR 11,450 / LKR 10,000 max)`.
    - *rdr-03 (Mohamed Ahamed)*: `Locked: Cash held > 4 hours (5h elapsed)`.
    - *rdr-11 (Roshan Jayaseelan)*: `Locked: Rider is currently offline`.
  - Unlocked, active store riders (*rdr-02 Niroshan*) have an active red **"Assign to Order"** button.
- Click **"Assign to Order"**. The order status updates to `"confirmed"` and the assigned rider is set.

### Step 8: Rider Shift Portal & Order Delivery Lifecycle (Core Demo C)
- Go to `/login` and click **Rider Courier** (`/rider`).
- The rider sees their assigned delivery. Execute the 3-step delivery workflow:
  1. Click **"Step 1: Accept Order"** $\rightarrow$ status changes to "preparing".
  2. Click **"Step 2: Pick Up from Store Hub"** $\rightarrow$ status changes to "out for delivery".
  3. Click **"Step 3: Confirm Delivery & Collect COD Cash"** $\rightarrow$ order status becomes "delivered", and COD cash is credited directly into the rider's **Cash-In-Hand Meter**.

### Step 9: Cash Meter Rules & Fast-Forward 4-Hour Simulation (Core Demo C)
- Notice the **Cash-In-Hand Safety Meter**:
  - If cash $\ge$ LKR 10,000: Shift is immediately locked! Large red alert appears: *"You must deposit the WHOLE collected cash amount before accepting new orders."*
  - Test the **"+1 Hr" Fast-Forward button**: click it to advance cash holding age. When holding age reaches 4 hours, the 4-hour rule locks the rider even if cash is under LKR 10,000!
- While locked, the rider cannot accept any new orders.
- Click **"Deposit Cash"**:
  - The modal enforces depositing the whole amount.
  - Review the prefilled Bank of Ceylon reference number and stamped receipt slip.
  - Click **"Submit for Verification"**. The deposit enters the verification queue with status `"pending"`.

### Step 10: Admin Cash Deposit Verification Queue (Core Demo D)
- Return to Admin and open `/admin/riders`.
- Switch to the **"Deposit Queue"** tab (displays active pending badge count).
- Inspect the pending deposit:
  - Rider name, Store Hub, Amount (LKR), Bank Ref #, and timestamp.
  - Click the **VIEW** receipt thumbnail to inspect the simulated Bank of Ceylon stamped deposit slip.
  - Click **"Approve"**: The deposit status changes to "approved", the deposited cash is deducted from the rider's balance, the timer resets, and the rider's shift is instantly unlocked!
  - *(Optional)* Test the **"Reject"** flow: selecting a reason (e.g. *"Illegible bank receipt stamp"*) rejects the deposit and keeps the rider locked until a valid slip is submitted.
- Finally, click the **"Reset demo data"** button in the persistent amber header banner at any time to restore fresh simulated data.
