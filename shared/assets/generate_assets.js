const fs = require('fs');
const path = require('path');

// Target output directories in D:\supermarket
const BASE_DIRS = [
  path.join(__dirname, 'images'),
  path.join(__dirname, '../../apps/admin_web/public/images'),
  path.join(__dirname, '../../packages/buyme_design/assets/images'),
];

const SUBDIRS = ['products', 'categories', 'banners', 'maps', 'brand'];

BASE_DIRS.forEach(baseDir => {
  SUBDIRS.forEach(d => {
    const p = path.join(baseDir, d);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });
});

function writeToAll(relPath, content) {
  BASE_DIRS.forEach(baseDir => {
    const fullPath = path.join(baseDir, relPath);
    const parent = path.dirname(fullPath);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
  });
}

// 8 Verified Categories
const categories = [
  { id: 'cat-produce', name: 'Fresh Fruits & Vegetables', nameTa: 'பழங்கள் & காய்கறிகள்', icon: 'carrot', color: '#16A34A', glow: '#DCFCE7' },
  { id: 'cat-staples', name: 'Rice, Grains & Flour', nameTa: 'அரிசி & தானியங்கள்', icon: 'wheat', color: '#D97706', glow: '#FEF3C7' },
  { id: 'cat-dairy', name: 'Dairy, Eggs & Chilled', nameTa: 'பால் & முட்டை', icon: 'milk', color: '#2563EB', glow: '#EFF6FF' },
  { id: 'cat-seafood', name: 'Lagoon & Sea Fish', nameTa: 'மீன் & கடல் உணவு', icon: 'fish', color: '#0284C7', glow: '#E0F2FE' },
  { id: 'cat-spices', name: 'Cooking Oils & Spices', nameTa: 'மசாலா & சமையல் எண்ணெய்', icon: 'flame', color: '#DC2626', glow: '#FEE2E2' },
  { id: 'cat-beverages', name: 'Ceylon Tea & Drinks', nameTa: 'தேயிலை & பானங்கள்', icon: 'coffee', color: '#B45309', glow: '#FEF3C7' },
  { id: 'cat-bakery', name: 'Bakery & Biscuits', nameTa: 'பேக்கரி & பிஸ்கட்', icon: 'cookie', color: '#CA8A04', glow: '#FEF9C3' },
  { id: 'cat-household', name: 'Household & Personal', nameTa: 'வீட்டு பராமரிப்பு', icon: 'sparkles', color: '#9333EA', glow: '#F3E8FF' },
];

// 42 Authentic Local Products
const products = [
  // Staples
  { id: 'prod-001', name: 'Batticaloa Red Raw Rice', nameTa: 'சிவப்பு பச்சை அரிசி', categoryId: 'cat-staples', price: 1250, unit: '5 kg pack', color: '#B91C1C' },
  { id: 'prod-002', name: 'Araliya Keeri Samba Rice', nameTa: 'கீரி சம்பா அரிசி', categoryId: 'cat-staples', price: 1450, unit: '5 kg pack', color: '#1E3A8A' },
  { id: 'prod-003', name: 'Nipuna White Raw Rice', nameTa: 'வெள்ளை பச்சை அரிசி', categoryId: 'cat-staples', price: 1180, unit: '5 kg pack', color: '#15803D' },
  { id: 'prod-004', name: 'Harischandra Kurakkan Flour', nameTa: 'குரக்கன் மா', categoryId: 'cat-staples', price: 460, unit: '400 g pack', color: '#78350F' },
  { id: 'prod-005', name: 'Prima All Purpose Wheat Flour', nameTa: 'கோதுமை மா', categoryId: 'cat-staples', price: 320, unit: '1 kg pack', color: '#CA8A04' },
  // Seafood
  { id: 'prod-006', name: 'Batticaloa Lagoon Jumbo Prawns', nameTa: 'மட்டக்களப்பு வாவி இறால்', categoryId: 'cat-seafood', price: 1850, unit: '500 g pack', color: '#EF4444' },
  { id: 'prod-007', name: 'Coastal Seer Fish Slices (Thora)', nameTa: 'தோரா மீன் துண்டுகள்', categoryId: 'cat-seafood', price: 2400, unit: '500 g pack', color: '#0284C7' },
  { id: 'prod-008', name: 'Fresh Lagoon Mud Crab', nameTa: 'வாவி நண்டு', categoryId: 'cat-seafood', price: 1650, unit: '1 kg pack', color: '#B91C1C' },
  { id: 'prod-009', name: 'Dry Sprats (Cleaned Nethili)', nameTa: 'சுத்தமான நெத்திலி கருவாடு', categoryId: 'cat-seafood', price: 680, unit: '250 g pack', color: '#CA8A04' },
  { id: 'prod-010', name: 'Fresh Yellowfin Tuna Cubes', nameTa: 'சூரை மீன் துண்டுகள்', categoryId: 'cat-seafood', price: 1350, unit: '500 g pack', color: '#BE123C' },
  // Dairy & Chilled
  { id: 'prod-011', name: 'Ambewela Fresh Full Cream Milk', nameTa: 'அம்பேவெல புதிய பால்', categoryId: 'cat-dairy', price: 480, unit: '1 L carton', color: '#2563EB' },
  { id: 'prod-012', name: 'Highland Buffalo Curd Clay Pot', nameTa: 'எருமைத் தயிர் சட்டி', categoryId: 'cat-dairy', price: 420, unit: '1 L pot', color: '#9A3412' },
  { id: 'prod-013', name: 'Farm Fresh Grade A Brown Eggs', nameTa: 'நாட்டுப் பண்ணை முட்டை', categoryId: 'cat-dairy', price: 540, unit: 'Pack of 10', color: '#D97706' },
  { id: 'prod-014', name: 'Kotmale Processed Cheddar Cheese', nameTa: 'செடர் பாலாடைக்கட்டி', categoryId: 'cat-dairy', price: 890, unit: '200 g block', color: '#F59E0B' },
  { id: 'prod-015', name: 'Pelwatte Salted Creamery Butter', nameTa: 'பெல்வத்த வெண்ணெய்', categoryId: 'cat-dairy', price: 780, unit: '200 g slab', color: '#FACC15' },
  // Produce (Fruits & Vegetables)
  { id: 'prod-016', name: 'Nuwara Eliya Crisp Carrots', nameTa: 'கரட்', categoryId: 'cat-produce', price: 340, unit: '1 kg', color: '#EA580C' },
  { id: 'prod-017', name: 'Eastern Red Shallots (Small Onions)', nameTa: 'சின்ன வெங்காயம்', categoryId: 'cat-produce', price: 520, unit: '1 kg', color: '#9F1239' },
  { id: 'prod-018', name: 'Fresh Spicy Green Chilies', nameTa: 'பச்சை மிளகாய்', categoryId: 'cat-produce', price: 280, unit: '250 g', color: '#15803D' },
  { id: 'prod-019', name: 'Fresh Country Tomatoes', nameTa: 'நாட்டுத் தக்காளி', categoryId: 'cat-produce', price: 380, unit: '1 kg', color: '#DC2626' },
  { id: 'prod-020', name: 'Fresh Lady\'s Fingers (Okra)', nameTa: 'வெண்டைக்காய்', categoryId: 'cat-produce', price: 260, unit: '500 g', color: '#16A34A' },
  { id: 'prod-021', name: 'Welimada Highland Potatoes', nameTa: 'உருளைக்கிழங்கு', categoryId: 'cat-produce', price: 320, unit: '1 kg', color: '#B45309' },
  { id: 'prod-022', name: 'Sweet Eastern Red Lady Papaya', nameTa: 'பப்பாசிப் பழம்', categoryId: 'cat-produce', price: 310, unit: '1 kg', color: '#F97316' },
  { id: 'prod-023', name: 'Sri Lankan Kolikuttu Bananas', nameTa: 'கோழிக்கூடு வாழைப்பழம்', categoryId: 'cat-produce', price: 420, unit: '1 kg bunch', color: '#EAB308' },
  { id: 'prod-024', name: 'Local Green Coconuts (Pol)', nameTa: 'தேங்காய்', categoryId: 'cat-produce', price: 140, unit: '1 nut', color: '#16A34A' },
  // Spices & Cooking Oils
  { id: 'prod-025', name: 'Baraka Pure Coconut Oil Bottle', nameTa: 'தேங்காய் எண்ணெய்', categoryId: 'cat-spices', price: 920, unit: '750 ml bottle', color: '#CA8A04' },
  { id: 'prod-026', name: 'Eastern Roasted Curry Powder', nameTa: 'வறுத்த கறித்தூள்', categoryId: 'cat-spices', price: 380, unit: '250 g pack', color: '#991B1B' },
  { id: 'prod-027', name: 'Ceylon Cinnamon Sticks (ALBA)', nameTa: 'கருவாப்பட்டை', categoryId: 'cat-spices', price: 650, unit: '100 g pack', color: '#78350F' },
  { id: 'prod-028', name: 'Pure Ground Turmeric Powder', nameTa: 'மஞ்சள் தூள்', categoryId: 'cat-spices', price: 290, unit: '100 g pack', color: '#EAB308' },
  { id: 'prod-029', name: 'Whole Black Peppercorns', nameTa: 'கருமிளகு', categoryId: 'cat-spices', price: 420, unit: '100 g pack', color: '#1F2430' },
  // Beverages
  { id: 'prod-030', name: 'Dilmah Premium Ceylon Tea', nameTa: 'டில்மா தேயிலை', categoryId: 'cat-beverages', price: 580, unit: '400 g pack', color: '#047857' },
  { id: 'prod-031', name: 'Watawala Pure Ceylon Dust Tea', nameTa: 'வட்டவளை தூள் தேயிலை', categoryId: 'cat-beverages', price: 540, unit: '400 g pack', color: '#B45309' },
  { id: 'prod-032', name: 'MD Mixed Fruit Cordial', nameTa: 'பழச்சாறு பாட்டில்', categoryId: 'cat-beverages', price: 620, unit: '750 ml bottle', color: '#DC2626' },
  { id: 'prod-033', name: 'Elephant House Cream Soda', nameTa: 'கிரீம் சோடா', categoryId: 'cat-beverages', price: 220, unit: '1.5 L bottle', color: '#15803D' },
  // Bakery & Snacks
  { id: 'prod-034', name: 'Munchee Super Cream Cracker', nameTa: 'கிரீம் கிராக்கர்', categoryId: 'cat-bakery', price: 240, unit: '500 g pack', color: '#CA8A04' },
  { id: 'prod-035', name: 'Maliban Real Lemon Puff Biscuits', nameTa: 'லெமன் பப் பிஸ்கட்', categoryId: 'cat-bakery', price: 180, unit: '200 g pack', color: '#FACC15' },
  { id: 'prod-036', name: 'Traditional Batticaloa Murukku', nameTa: 'கார முறுக்கு', categoryId: 'cat-bakery', price: 260, unit: '200 g pack', color: '#EA580C' },
  { id: 'prod-037', name: 'Kist Pure Strawberry Jam', nameTa: 'ஸ்டோபெரி ஜாம்', categoryId: 'cat-bakery', price: 490, unit: '300 g jar', color: '#991B1B' },
  { id: 'prod-038', name: 'Maggi Chicken Noodles Pack', nameTa: 'மகி நூடுல்ஸ்', categoryId: 'cat-bakery', price: 360, unit: '4-in-1 pack', color: '#EAB308' },
  // Household & Personal
  { id: 'prod-039', name: 'Sunlight Clean Dishwash Liquid', nameTa: 'பாத்திரம் கழுவும் திரவம்', categoryId: 'cat-household', price: 290, unit: '500 ml bottle', color: '#0284C7' },
  { id: 'prod-040', name: 'Dettol Disinfectant Antiseptic', nameTa: 'டெட்டோல் கிருமிநாசினி', categoryId: 'cat-household', price: 650, unit: '500 ml bottle', color: '#16A34A' },
  { id: 'prod-041', name: 'Surf Excel Matic Washing Powder', nameTa: 'சலவைத் தூள்', categoryId: 'cat-household', price: 820, unit: '1 kg pack', color: '#1E3A8A' },
  { id: 'prod-042', name: 'Kohomba Herbal Ayurvedic Soap', nameTa: 'கொஹொம்ப மூலிகை சோப்', categoryId: 'cat-household', price: 140, unit: '100 g bar', color: '#15803D' },
];

// Helper to generate product vector illustration
function generateProductSvg(p) {
  const cat = categories.find(c => c.id === p.categoryId) || categories[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" rx="32" fill="#FFF9F9" />
  <rect x="1" y="1" width="398" height="398" rx="31" stroke="#F3F4F6" stroke-width="2" />
  <circle cx="200" cy="200" r="140" fill="${cat.glow}" filter="blur(35px)" opacity="0.8" />
  <ellipse cx="200" cy="330" rx="90" ry="14" fill="#1F2430" opacity="0.06" />

  <g transform="translate(24, 24)">
    <rect width="125" height="26" rx="13" fill="#FFFFFF" stroke="${p.color}" stroke-width="1.2" />
    <circle cx="14" cy="13" r="4" fill="${p.color}" />
    <text x="26" y="17" font-family="-apple-system, sans-serif" font-size="10" font-weight="800" fill="${p.color}">BUYME FRESH</text>
  </g>

  <g transform="translate(100, 100)">
    <rect x="15" y="15" width="170" height="170" rx="28" fill="${p.color}" opacity="0.12" />
    <rect x="30" y="30" width="140" height="140" rx="20" fill="${p.color}" opacity="0.2" />
    <circle cx="100" cy="95" r="46" fill="${p.color}" />
    <circle cx="100" cy="95" r="40" fill="#FFFFFF" opacity="0.18" />
    <path d="M85 80 L115 80 L120 120 L80 120 Z" fill="#FFFFFF" />
    <path d="M92 80 C92 72, 108 72, 108 80" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" />
    <circle cx="100" cy="100" r="4" fill="#FFC20E" />
  </g>

  <text x="200" y="300" font-family="-apple-system, sans-serif" font-weight="800" font-size="14" text-anchor="middle" fill="#1F2430">${p.name.replace(/&/g, "&amp;")}</text>
  <text x="200" y="322" font-family="'Noto Sans Tamil', sans-serif" font-weight="600" font-size="12" text-anchor="middle" fill="${p.color}">${p.nameTa.replace(/&/g, "&amp;")}</text>
</svg>`;
}

// 1. Generate 42 Products
products.forEach(p => {
  const svg = generateProductSvg(p);
  writeToAll(`products/${p.id}.svg`, svg);
});
console.log(`Generated ${products.length} product SVGs.`);

// Fallback Product Placeholder
const placeholderSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" rx="32" fill="#FFF9F9" />
  <rect x="1" y="1" width="398" height="398" rx="31" stroke="#F3F4F6" stroke-width="2" />
  <circle cx="200" cy="200" r="120" fill="#FFE9EC" filter="blur(30px)" opacity="0.7" />
  <ellipse cx="200" cy="320" rx="70" ry="12" fill="#1F2430" opacity="0.06" />
  <g transform="translate(140, 130)">
    <rect x="15" y="30" width="90" height="90" rx="18" fill="#E4002B" opacity="0.12" stroke="#E4002B" stroke-width="2" />
    <path d="M40 75 L60 95 L85 55" stroke="#E4002B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </g>
  <text x="200" y="270" font-family="sans-serif" font-weight="800" font-size="14" text-anchor="middle" fill="#1F2430">BuyMe Verified Grocery</text>
  <text x="200" y="292" font-family="sans-serif" font-weight="600" font-size="11" text-anchor="middle" fill="#6B7280">Batticaloa Store Harvest</text>
</svg>`;
writeToAll('products/placeholder.svg', placeholderSvg);

// 2. Generate 8 Categories
categories.forEach(c => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" rx="36" fill="#FFF9F9" />
  <rect x="1" y="1" width="398" height="398" rx="35" stroke="#F3F4F6" stroke-width="2" />
  <circle cx="200" cy="180" r="120" fill="${c.glow}" filter="blur(30px)" />
  <ellipse cx="200" cy="290" rx="70" ry="12" fill="#1F2430" opacity="0.06" />
  <circle cx="200" cy="170" r="54" fill="${c.color}" />
  <circle cx="200" cy="170" r="48" fill="#FFFFFF" opacity="0.18" />
  <text x="200" y="260" font-family="-apple-system, sans-serif" font-weight="900" font-size="16" text-anchor="middle" fill="#1F2430">${c.name.replace(/&/g, "&amp;")}</text>
  <text x="200" y="285" font-family="'Noto Sans Tamil', sans-serif" font-weight="700" font-size="13" text-anchor="middle" fill="${c.color}">${c.nameTa.replace(/&/g, "&amp;")}</text>
  <text x="200" y="315" font-family="-apple-system, sans-serif" font-weight="600" font-size="11" text-anchor="middle" fill="#6B7280">10 Batticaloa Stores</text>
</svg>`;
  writeToAll(`categories/${c.id}.svg`, svg);
});
console.log(`Generated ${categories.length} category SVGs.`);

// 3. Generate 3 Hero Banners
const banner1 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="360" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="360" rx="28" fill="#1F2430" />
  <circle cx="150" cy="100" r="180" fill="#E4002B" filter="blur(80px)" opacity="0.45" />
  <circle cx="650" cy="250" r="220" fill="#B80022" filter="blur(90px)" opacity="0.5" />
  <circle cx="400" cy="180" r="140" fill="#FFC20E" filter="blur(70px)" opacity="0.25" />
  <g transform="translate(60, 48)">
    <rect width="210" height="30" rx="15" fill="rgba(228, 0, 43, 0.25)" stroke="#E4002B" stroke-width="1.5" />
    <circle cx="16" cy="15" r="5" fill="#FFC20E" />
    <text x="30" y="19" font-family="sans-serif" font-size="11" font-weight="800" fill="#FFFFFF">BATTICALOA SUPER DELIVERY</text>
  </g>
  <text x="60" y="130" font-family="sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">BuyMe Fresh Groceries</text>
  <text x="60" y="170" font-family="sans-serif" font-size="15" font-weight="500" fill="#E5E7EB">Cash on Delivery only • 10 dedicated store pools across Batticaloa.</text>
  <text x="60" y="205" font-family="'Noto Sans Tamil', sans-serif" font-size="13.5" font-weight="600" fill="#FFC20E">மட்டக்களப்பு நகரின் 10 கிளைகளிலிருந்து விரைவான விநியோகம்.</text>
  <g transform="translate(60, 240)">
    <rect width="180" height="48" rx="14" fill="#E4002B" />
    <text x="90" y="29" font-family="sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">SHOP NOW</text>
  </g>
</svg>`;
writeToAll('banners/banner-deals.svg', banner1);

const banner2 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="360" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="360" rx="28" fill="#18181B" />
  <circle cx="200" cy="180" r="180" fill="#0284C7" filter="blur(80px)" opacity="0.45" />
  <circle cx="650" cy="150" r="200" fill="#E4002B" filter="blur(90px)" opacity="0.35" />
  <g transform="translate(60, 48)">
    <rect width="210" height="30" rx="15" fill="rgba(255, 194, 14, 0.2)" stroke="#FFC20E" stroke-width="1.5" />
    <text x="105" y="19" font-family="sans-serif" font-size="11" font-weight="800" fill="#FFC20E" text-anchor="middle">FREE DELIVERY OVER LKR 5,000</text>
  </g>
  <text x="60" y="130" font-family="sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">Lagoon Catch & Sea Fish</text>
  <text x="60" y="170" font-family="sans-serif" font-size="15" font-weight="500" fill="#E5E7EB">Packed fresh daily from Batticaloa and Valaichenai coast.</text>
  <text x="60" y="205" font-family="'Noto Sans Tamil', sans-serif" font-size="13.5" font-weight="600" fill="#93C5FD">வாவி இறால் மற்றும் புதிய கடல் மீன் வகைகள்.</text>
</svg>`;
writeToAll('banners/banner-seafood.svg', banner2);

const banner3 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="360" viewBox="0 0 800 360" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="360" rx="28" fill="#14532D" />
  <circle cx="200" cy="180" r="180" fill="#16A34A" filter="blur(80px)" opacity="0.45" />
  <circle cx="650" cy="200" r="200" fill="#E4002B" filter="blur(90px)" opacity="0.25" />
  <g transform="translate(60, 48)">
    <rect width="180" height="30" rx="15" fill="rgba(34, 197, 94, 0.25)" stroke="#4ADE80" stroke-width="1.5" />
    <text x="90" y="19" font-family="sans-serif" font-size="11" font-weight="800" fill="#86EFAC" text-anchor="middle">100% FARM HARVEST</text>
  </g>
  <text x="60" y="130" font-family="sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">Fresh Garden Veggies</text>
  <text x="60" y="170" font-family="sans-serif" font-size="15" font-weight="500" fill="#DCFCE7">Delivered cold-chain fresh to your doorstep within 30 minutes.</text>
</svg>`;
writeToAll('banners/banner-farm.svg', banner3);

// 4. Stylized Batticaloa District Map Canvas (1000x800)
const mapSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="800" viewBox="0 0 1000 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1000" height="800" fill="#FFFDFD" />
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(228, 0, 43, 0.06)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1000" height="800" fill="url(#grid)" />
  <path d="M 0 0 L 680 0 Q 720 120 700 240 Q 750 380 720 500 Q 760 620 710 750 L 690 800 L 0 800 Z" fill="#FEE9EC" stroke="#FCA5A5" stroke-width="2" />
  <text x="850" y="380" font-family="sans-serif" font-weight="800" font-size="16" fill="#9CA3AF" letter-spacing="4" transform="rotate(90 850 380)">INDIAN OCEAN</text>
  <path d="M 640 180 Q 600 240 610 320 Q 640 400 620 500 Q 590 600 610 700" stroke="#BAE6FD" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.9" />
  <path d="M 640 180 Q 600 240 610 320 Q 640 400 620 500 Q 590 600 610 700" stroke="#0284C7" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.6" />
  <path d="M 500 80 L 530 140 L 570 240 L 610 330 L 630 450 L 640 580 L 630 720" stroke="#D1D5DB" stroke-width="3" stroke-dasharray="6,4" fill="none" />

  <g transform="translate(500, 760)">
    <rect x="-180" y="-22" width="360" height="34" rx="17" fill="rgba(31, 36, 48, 0.9)" />
    <text x="0" y="0" font-family="sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
      APPROXIMATE — DEMO ONLY
    </text>
  </g>

  <g transform="translate(40, 50)">
    <rect width="320" height="70" rx="18" fill="rgba(255, 255, 255, 0.92)" stroke="#E4002B" stroke-width="1.5" />
    <text x="20" y="30" font-family="sans-serif" font-weight="900" font-size="16" fill="#1F2430">BuyMe Batticaloa District</text>
    <text x="20" y="52" font-family="sans-serif" font-weight="700" font-size="12" fill="#E4002B">10 Proposed Store Hubs Network</text>
  </g>

  <!-- 1. Batticaloa Town -->
  <g transform="translate(610, 330)">
    <circle cx="0" cy="0" r="42" fill="rgba(228, 0, 43, 0.12)" />
    <circle cx="0" cy="0" r="22" fill="rgba(228, 0, 43, 0.28)" />
    <circle cx="0" cy="0" r="11" fill="#E4002B" stroke="#FFFFFF" stroke-width="3" />
    <rect x="18" y="-18" width="165" height="36" rx="10" fill="#1F2430" />
    <text x="28" y="-2" font-family="sans-serif" font-weight="900" font-size="11" fill="#FFFFFF">1. Batticaloa Town</text>
    <text x="28" y="11" font-family="sans-serif" font-weight="700" font-size="9" fill="#FFC20E">MAIN HUB • 5.0 km</text>
  </g>
  <!-- 2. Kattankudy -->
  <g transform="translate(625, 410)">
    <circle cx="0" cy="0" r="8" fill="#E4002B" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="14" y="-14" width="135" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="22" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">2. Kattankudy</text>
  </g>
  <!-- 3. Eravur -->
  <g transform="translate(575, 260)">
    <circle cx="0" cy="0" r="8" fill="#E4002B" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="14" y="-14" width="120" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="22" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">3. Eravur</text>
  </g>
  <!-- 4. Valaichenai -->
  <g transform="translate(510, 110)">
    <circle cx="0" cy="0" r="9" fill="#E4002B" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="14" y="-14" width="135" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="22" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">4. Valaichenai</text>
  </g>
  <!-- 5. Oddamavadi -->
  <g transform="translate(470, 125)">
    <circle cx="0" cy="0" r="8" fill="#B80022" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="-140" y="-14" width="125" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="-132" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">5. Oddamavadi</text>
  </g>
  <!-- 6. Chenkalady -->
  <g transform="translate(550, 210)">
    <circle cx="0" cy="0" r="8" fill="#E4002B" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="-135" y="-14" width="120" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="-127" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">6. Chenkalady</text>
  </g>
  <!-- 7. Kaluwanchikudy -->
  <g transform="translate(635, 550)">
    <circle cx="0" cy="0" r="9" fill="#E4002B" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="14" y="-14" width="150" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="22" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">7. Kaluwanchikudy</text>
  </g>
  <!-- 8. Arayampathy -->
  <g transform="translate(630, 470)">
    <circle cx="0" cy="0" r="8" fill="#B80022" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="14" y="-14" width="130" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="22" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">8. Arayampathy</text>
  </g>
  <!-- 9. Kiran -->
  <g transform="translate(535, 160)">
    <circle cx="0" cy="0" r="8" fill="#B80022" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="-105" y="-14" width="90" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="-97" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">9. Kiran</text>
  </g>
  <!-- 10. Vellavely -->
  <g transform="translate(540, 640)">
    <circle cx="0" cy="0" r="8" fill="#E4002B" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="-120" y="-14" width="105" height="28" rx="8" fill="#FFFFFF" stroke="#E5E7EB" />
    <text x="-112" y="4" font-family="sans-serif" font-weight="800" font-size="10" fill="#1F2430">10. Vellavely</text>
  </g>
</svg>`;
writeToAll('maps/batticaloa-district-map.svg', mapSvg);

// 5. Brand Logo SVG
const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="60" viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="10" width="40" height="40" rx="12" fill="#E4002B" />
  <circle cx="22" cy="30" r="9" fill="#FFC20E" />
  <path d="M18 30 L21 33 L27 27" stroke="#1F2430" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  <text x="52" y="38" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="28" fill="#1F2430">Buy<tspan fill="#E4002B">Me</tspan></text>
</svg>`;
writeToAll('brand/buyme-logo.svg', logoSvg);

// 6. Update products.json and categories.json in shared/data
const productsWithImages = products.map(p => ({
  ...p,
  imageUrl: `/images/products/${p.id}.svg`,
}));
fs.writeFileSync(path.join(__dirname, '../data/products.json'), JSON.stringify(productsWithImages, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, '../data/categories.json'), JSON.stringify(categories, null, 2), 'utf8');
console.log('Successfully updated shared/data/products.json and categories.json.');

