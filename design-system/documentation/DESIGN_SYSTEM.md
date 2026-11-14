# BuyMe Design System & Visual Foundation
**Premium Supermarket Technology — Neon Blue + Ice White + Translucent Glass**

---

## 1. Brand Concept & Philosophy
BuyMe is an enterprise-grade multi-store grocery delivery platform built specifically for Batticaloa District, Eastern Province, Sri Lanka. The brand visual identity is engineered to communicate freshness, technological refinement, speed, and trust.

### Core Visual Equation
$$\text{Premium Supermarket} = \text{Neon Blue } (\#168BFF) + \text{Ice White } (\#F7FAFF) + \text{Translucent Frosted Glass}$$

---

## 2. Color Tokens

| Token Name | Hex / RGBA Value | Semantic Purpose |
| :--- | :--- | :--- |
| **Primary Neon Blue** | `#168BFF` | Key action buttons, active navigation states, selected filters, progress rings |
| **Deep Blue** | `#0866CC` | Button press states, gradients, subtle brand accents |
| **Ice White** | `#F7FAFF` | Application background, canvas fill, card container contrast |
| **Soft Blue** | `#EAF3FF` | Secondary button fills, category chip badges, table alternate rows |
| **Light Glass Surface** | `rgba(255, 255, 255, 0.70)` | Frosted cards, floating navigation bars, bottom sheets |
| **Elevated Glass Surface** | `rgba(255, 255, 255, 0.85)` | Modal dialogs, action sheets, dropdown overlays |
| **Dark Navy Text** | `#10243B` | Primary headings, product titles, numerical prices |
| **Secondary Slate** | `#62748A` | Subtitles, product weight/units, timestamps, helper text |
| **Subtle Border** | `rgba(255, 255, 255, 0.75)` | Glass borders, cards, divider highlights |
| **Border Neon** | `rgba(22, 139, 255, 0.40)` | Interactive focus states, hover borders |
| **Success (Muted Green)** | `#10B981` | Order delivered, in-stock badges, positive revenue trends |
| **Warning (Soft Amber)**| `#F59E0B` | Low-stock alerts, order preparing, pending rider dispatch |
| **Error (Restrained Red)**| `#EF4444` | Out of stock, order cancellation, destructive confirmations |

---

## 3. Typography Architecture

Loaded via Google Fonts:
- **Primary Headings & Key Metrics**: `Manrope` (Weights: 600 SemiBold, 700 Bold, 800 ExtraBold). Chosen for its balanced geometric structure, clean numerals, and authoritative readability.
- **Body & Controls**: `DM Sans` (Weights: 400 Regular, 500 Medium, 600 SemiBold). Chosen for its warm humanistic legibility on mobile screens.

### Type Scale
- **Display Hero**: Manrope 800 • 36px–48px • Line Height 1.15
- **Section Heading (H1)**: Manrope 800 • 28px–32px • Line Height 1.2
- **Card Title (H2/H3)**: Manrope 700 • 18px–20px • Line Height 1.3
- **Body Large**: DM Sans 400 • 16px • Line Height 1.5
- **Body Regular**: DM Sans 400 • 14px • Line Height 1.45
- **Caption & Meta**: DM Sans 500 • 12px • Line Height 1.4
- **Currency & Numerals**: Manrope 700/800 • e.g. `LKR 1,450.00`

---

## 4. Glassmorphism Design Tokens

To prevent visual noise while maximizing modern aesthetic appeal, glassmorphism is applied with strict functional rules:

### Standard Glass Card (`--glass-surface-standard`)
```css
background: rgba(255, 255, 255, 0.70);
backdrop-filter: blur(16px) saturate(180%);
-webkit-backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.75);
box-shadow: 0 10px 32px 0 rgba(16, 36, 59, 0.07), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
border-radius: 20px;
```

### Elevated Modal Dialog (`--glass-surface-elevated`)
```css
background: rgba(255, 255, 255, 0.88);
backdrop-filter: blur(28px) saturate(200%);
-webkit-backdrop-filter: blur(28px) saturate(200%);
border: 1px solid rgba(255, 255, 255, 0.90);
box-shadow: 0 25px 60px rgba(16, 36, 59, 0.18), 0 0 0 1px rgba(22, 139, 255, 0.1);
border-radius: 28px;
```

### Accessibility & Contrast Safeguards
1. All text elements maintain a minimum contrast ratio of **4.5:1** against the glass background.
2. Background blur is capped between **12px and 28px** to eliminate legibility degradation over dynamic background elements.
3. For dense data tables and long lists, opacity is raised to `0.85–0.92` to maintain effortless reading.

---

## 5. Shared Local Mock Data Ecosystem

All four frontend applications share the central data model located in `/shared/data/`:
- **Stores (`stores.json`)**: 10 BuyMe Stores across Batticaloa District (Batticaloa Town, Kattankudy, Eravur, Valaichenai, Oddamavadi, Chenkalady, Kaluwanchikudy, Arayampathy, Kiran, Vellavely).
- **Categories (`categories.json`)**: 10 bilingual departments (Rice & Grains, Fresh Vegetables, Lagoon Seafood, Dairy & Eggs, Fruits, Essentials, Bakery, Snacks, Household, Beverages).
- **Products (`products.json`)**: 35 local Batticaloa items with verified prices in LKR, Tamil translations, accurate units, and 10-store stock numbers.
- **Riders (`riders.json`)**: 15 Batticaloa delivery riders with Eastern Province (EP) vehicle registrations, ratings, and shift earnings.
- **Customers (`customers.json`)**: 30 authentic Batticaloa customer profiles across Puliyanthivu, Koddaimunai, Kattankudy, Eravur, etc.
- **Orders (`orders.json`)**: 22 sample orders spanning all seven lifecycle states (`pending`, `confirmed`, `preparing`, `ready_for_pickup`, `out_for_delivery`, `delivered`, `cancelled`).
- **Inventory (`inventory.json`)**: SKU-level 10-store stock tracking with safety threshold alerts.

---

## 6. Applications Cross-Platform Architecture

```
supermarket/
├── design-system/                  # Design tokens, documentation & interactive preview
├── shared/                         # Central mock data & domain repository contracts
├── apps/
│   ├── customer_app/               # Flutter (iOS, Android) — Shopping & simulated tracking
│   ├── rider_app/                  # Flutter (iOS, Android) — Delivery operations & navigation
│   ├── admin_app/                  # Flutter (iOS, Android) — Mobile management & orders
│   └── admin_web/                  # Next.js 14+ TypeScript — Executive Web Dashboard
```

