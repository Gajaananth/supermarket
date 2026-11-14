# BuyMe Batticaloa — Client Demonstration & Walkthrough Guide
**Official Supermarket Brand:** BuyMe  
**Geographical Scope:** Batticaloa District, Eastern Province, Sri Lanka (Exclusively)  
**Design Identity:** Neon Ice Glass (`#168BFF` Neon Blue, `#0866CC` Deep Blue, `#F7FAFF` Ice White, `#10243B` Dark Navy)  
**Currency:** Sri Lankan Rupee (LKR)  
**Languages:** English & Tamil (தமிழ்)  

---

## 1. Demo Credentials & Sample Accounts

All applications operate on a **purely local, synchronized mock architecture**. No external backend, database, or payment gateway setup is required. Use the following pre-configured credentials to demonstrate each persona:

### A. Customer Persona
- **Name:** Kajan Sivanesan
- **Mobile Number:** `+94 77 123 4567` (or enter any 9-digit Sri Lankan number)
- **Demo Password:** `buyme2026`
- **Default Delivery Address:** `14/2 Central Road, Puliyanthivu, Batticaloa`
- **Loyalty Rewards Balance:** ⭐ `420 pts`
- **Preferred Fulfillment Hub:** `BuyMe Batticaloa Town Hub (DMB-01)`

### B. Rider Persona (Motorcycle Fleet)
- **Name:** Niroshan Tharmalingam
- **Rider ID / Call Sign:** `RDR-BTC-001`
- **Vehicle Registration:** `EP BDF-4821` (Bajaj Discover 125cc)
- **Assigned Depot:** `BuyMe Batticaloa Town Hub`
- **Mobile Number:** `+94 77 234 5678`
- **Demo PIN:** `1234`
- **Shift Earnings:** `LKR 4,850.00` (6 completed trips)
- **Cash on Delivery in Hand:** `LKR 12,410.00`

### C. Admin & Store Supervisor Persona
- **Name:** Tharshan Yogarajah
- **Role:** Batticaloa District Operations Manager
- **Staff ID:** `STF-BTC-01`
- **Admin Email:** `admin@buyme.lk`
- **Admin Password:** `buyme@admin2026`
- **Assigned Hub:** `BuyMe Batticaloa Town Hub (Central Depot)`

---

## 2. 10 Proposed BuyMe Stores in Batticaloa District

The prototype models 10 strategically distributed fulfillment superstores covering all key population clusters in Batticaloa District:

| Code | Store Name | Locality | Address | Phone | Delivery Radius |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`DMB-01`** | BuyMe Batticaloa Town | Puliyanthivu | 14/2 Central Road, Puliyanthivu | `+94 65 222 4101` | 12.0 km |
| **`DMB-02`** | BuyMe Kattankudy | Kattankudy | 88 Main Street, Kattankudy 03 | `+94 65 224 8202` | 8.5 km |
| **`DMB-03`** | BuyMe Eravur | Eravur | 45 Chenkalady Road, Eravur Town | `+94 65 224 1303` | 10.0 km |
| **`DMB-04`** | BuyMe Valaichenai | Valaichenai | 112 Main Street, Valaichenai Junction | `+94 65 225 7404` | 14.0 km |
| **`DMB-05`** | BuyMe Oddamavadi | Oddamavadi | 19 Bridge View Road, Oddamavadi | `+94 65 225 9505` | 9.0 km |
| **`DMB-06`** | BuyMe Chenkalady | Chenkalady | 62 Badulla Road, Chenkalady Junction | `+94 65 224 3606` | 11.5 km |
| **`DMB-07`** | BuyMe Kaluwanchikudy | Kaluwanchikudy | 33 Main Street, Kaluwanchikudy Town | `+94 65 226 2707` | 10.0 km |
| **`DMB-08`** | BuyMe Arayampathy | Arayampathy | 24 Hospital Road, Arayampathy | `+94 65 222 8808` | 8.0 km |
| **`DMB-09`** | BuyMe Kiran | Kiran | 17 Coastal Highway, Kiran Central | `+94 65 225 5909` | 9.5 km |
| **`DMB-10`** | BuyMe Vellavely | Vellavely | 08 Mandur Road, Vellavely Agrarian Center | `+94 65 226 8010` | 12.5 km |

---

## 3. Step-by-Step Client Pitch Walkthrough

### Scenario 1: Customer Grocery Shopping & Cash on Delivery (COD)
1. **Launch:** Open the **Master Presentation Suite** (`apps/presentation_suite/index.html`) or the In-IDE simulator (`mobile_app_live.html`).
2. **Switch Language:** Click the **`தமிழ்`** button. Notice all category names, product titles, and delivery terms immediately render in authentic Unicode Tamil. Click **`EN`** to switch back to English.
3. **Change Store:** Tap on the top store header (`BuyMe Batticaloa Town ▾`). Notice the customer can select any of the 10 Batticaloa stores.
4. **Browse Catalog:**
   - Tap **`+ Add`** on *Eastern Star Batticaloa Red Raw Rice (5 kg)* — LKR 1,250.
   - Tap **`+ Add`** on *Batticaloa Lagoon Jumbo Prawns (500 g)* — LKR 1,650.
   - Tap **`+ Add`** on *Ambewela Farm Fresh Milk (1L)* — LKR 540.
5. **View Basket:** Tap the bottom **`🛒 Cart`** tab. Notice itemized quantities, unit prices in LKR, the standard Batticaloa delivery fee of **LKR 250.00**, and the computed Grand Total.
6. **Checkout:** Tap **`Proceed to Checkout`**. Highlight the **Cash on Delivery (COD)** payment card ("Pay rider upon doorstep grocery receipt").
7. **Confirm Order:** Tap **`Confirm Order (#DMB-901)`**.
8. **Live Tracking:** The screen immediately transitions to simulated real-time tracking showing Rider **Niroshan Tharmalingam (EP BDF-4821)** navigating along Bar Road, Puliyanthivu with an estimated arrival time of 14 minutes.

---

### Scenario 2: Rider Mobile Delivery & Cash Collection
1. **Switch to Rider Mode:** In the top switcher bar, select **`🛵 Rider Mobile App`**.
2. **Shift Status:** Observe the top shift telemetry badge showing `ONLINE • BATTICALOA FLEET`. Toggle the shift button to demonstrate offline/online availability.
3. **Active Trip Card:** Review Order `#DMB-2026-901`:
   - **Pickup Hub:** `BuyMe Batticaloa Town Hub (14/2 Central Road, Puliyanthivu)`
   - **Dropoff:** `Kajan Sivanesan (Puliyanthivu)`
   - **Collect Cash:** `LKR 5,190.00 (COD)`
4. **GPS Navigation:** Tap **`Open GPS`**. Demonstrate the simulated turn-by-turn route instructions ("In 280 meters, turn right onto Central Road, Puliyanthivu") with live speed telemetry (42 km/h).
5. **Complete Delivery:** Tap **`Complete Trip`**. Notice the in-DOM confirmation alerting that the trip is completed and **LKR 400.00** delivery fee is credited to the rider's shift earnings.
6. **Shift Earnings:** Tap the bottom **`💰 Earnings`** tab to view today's total shift earnings (**LKR 4,850.00**) and total cash in hand (**LKR 12,410.00**).

---

### Scenario 3: Admin Mobile Store Supervision & Inventory
1. **Switch to Admin Mode:** In the top switcher bar, select **`💼 Admin Mobile App`**.
2. **Overview Statistics:** Highlight the district revenue card (**LKR 184,520.00**) aggregated across all 10 Batticaloa stores, 22 active orders, and 15 riders online.
3. **Orders Stream:** Tap the **`🛍️ Orders`** tab to view live order progression across Batticaloa Town, Kattankudy, Eravur, and Valaichenai.
4. **Stock Matrix:** Tap the **`📦 Stock`** tab to view the multi-store stock levels. Highlight the low-stock alert for *Lagoon Jumbo Prawns* at Oddamavadi Hub (12 units remaining).
5. **Stores Status:** Tap the **`🏬 Hubs`** tab to inspect all 10 Batticaloa stores with active store manager names and contact numbers.

---

### Scenario 4: Next.js Executive Web Operations Center (Desktop)
1. **Start the Production Web App:**
   - Open a terminal in `apps/admin_web` from the repository root.
   - Run: `npm start` (or verify that it is already running on port 3000).
   - Navigate to [`http://localhost:3000`](http://localhost:3000) in Google Chrome or Edge.
2. **Executive Overview:**
   - View the 4 top KPI cards (Gross Revenue LKR 184,520, Orders Velocity, Fleet Status, 10 Hubs Online).
   - Review the Recharts gross revenue curve and top 5 Batticaloa stores fulfillment ranking.
3. **Multi-Store Orders Filter:**
   - Click **`Orders`** in the sidebar.
   - Use the **Store Filter** dropdown to filter orders by `BuyMe Kattankudy Hub` or `BuyMe Batticaloa Town Hub`.
   - Click on any order to open the modal and assign an available motorcycle rider from the 15-fleet roster.
4. **10-Hub Inventory Matrix:**
   - Click **`Inventory`** in the sidebar.
   - Search for "rice" or "prawns".
   - Click **`Adjust Stock`** on *Batticaloa Red Raw Rice* to rebalance inventory across the 10 Batticaloa stores.
5. **Dispatch Canvas Map:**
   - Click **`Deliveries`** in the sidebar.
   - View the live radar canvas mapping BuyMe Batticaloa Town Hub to Puliyanthivu destination with Rider Kajan Sivanesan (EP BDF-4821).
6. **Executive CSV Report Export:**
   - Click **`Reports`** in the sidebar.
   - Click **`Export CSV`**. A formatted sales report named `BuyMe_Batticaloa_Sales_Report_*.csv` will download immediately with authentic Batticaloa store metrics.

---

## 4. Resetting Demo State

The prototype uses decoupled in-memory / local state:
- To reset the presentation suite, simply refresh the browser page (`F5`).
- To reset the Next.js web dashboard, refresh `http://localhost:3000`.
- All demo data is cleanly re-seeded from `shared/data/` on each load.

