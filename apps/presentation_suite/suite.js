/**
 * BuyMe Multi-Platform Presentation Prototype Suite Engine
 * Batticaloa District, Eastern Province, Sri Lanka
 * 
 * Controls Customer, Rider, Admin Mobile, and Web Dashboard simulations.
 * Purely local state with bilingual (English/Tamil) capability.
 */

// 1. Central App State
let activeApp = "customer";
let activeScreen = "home";
let activeStoreId = "DMB-01"; // BuyMe Batticaloa Town Hub
let appLang = "en"; // "en" or "ta"

// 2. Ten Proposed BuyMe Stores in Batticaloa District
const BRANCHES = [
  { id: "DMB-01", name: "BuyMe Batticaloa Town", locality: "Puliyanthivu", address: "14/2 Central Road, Puliyanthivu, Batticaloa", phone: "+94 65 222 4101", radius: "12.0 km", fee: 250, manager: "Tharshan Yogarajah" },
  { id: "DMB-02", name: "BuyMe Kattankudy", locality: "Kattankudy", address: "88 Main Street, Kattankudy 03", phone: "+94 65 224 8202", radius: "8.5 km", fee: 250, manager: "Mohamed Rilwan" },
  { id: "DMB-03", name: "BuyMe Eravur", locality: "Eravur", address: "45 Chenkalady Road, Eravur Town", phone: "+94 65 224 1303", radius: "10.0 km", fee: 250, manager: "Niroshan Perinpanathan" },
  { id: "DMB-04", name: "BuyMe Valaichenai", locality: "Valaichenai", address: "112 Main Street, Valaichenai Junction", phone: "+94 65 225 7404", radius: "14.0 km", fee: 250, manager: "Kavitha Sivakumar" },
  { id: "DMB-05", name: "BuyMe Oddamavadi", locality: "Oddamavadi", address: "19 Bridge View Road, Oddamavadi", phone: "+94 65 225 9505", radius: "9.0 km", fee: 250, manager: "Ahamed Musthafa" },
  { id: "DMB-06", name: "BuyMe Chenkalady", locality: "Chenkalady", address: "62 Badulla Road, Chenkalady Junction", phone: "+94 65 224 3606", radius: "11.5 km", fee: 250, manager: "Yathushan Rasiah" },
  { id: "DMB-07", name: "BuyMe Kaluwanchikudy", locality: "Kaluwanchikudy", address: "33 Main Street, Kaluwanchikudy Town", phone: "+94 65 226 2707", radius: "10.0 km", fee: 250, manager: "Mathushan Kandasamy" },
  { id: "DMB-08", name: "BuyMe Arayampathy", locality: "Arayampathy", address: "24 Hospital Road, Arayampathy", phone: "+94 65 222 8808", radius: "8.0 km", fee: 250, manager: "Jeroshan Anthony" },
  { id: "DMB-09", name: "BuyMe Kiran", locality: "Kiran", address: "17 Coastal Highway, Kiran Central", phone: "+94 65 225 5909", radius: "9.5 km", fee: 250, manager: "Tharshini Kaneshan" },
  { id: "DMB-10", name: "BuyMe Vellavely", locality: "Vellavely", address: "08 Mandur Road, Vellavely Agrarian Center", phone: "+94 65 226 8010", radius: "12.5 km", fee: 250, manager: "Roshan De Silva" }
];

// 3. Batticaloa District Products Catalog (LKR)
const PRODUCTS = [
  { id: "prod-001", name: "Batticaloa Red Raw Rice", nameTa: "மட்டக்களப்பு சிவப்பு பச்சரிசி", unit: "5 kg bag", price: 1250.0, category: "Rice & Grains", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", stock: 185 },
  { id: "prod-002", name: "Araliya Keeri Samba Rice", nameTa: "அரலியா கீரி சம்பா அரிசி", unit: "5 kg pack", price: 1450.0, category: "Rice & Grains", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80", stock: 240 },
  { id: "prod-003", name: "Ambewela Fresh Farm Milk", nameTa: "அம்பேவெல புதிய பசும்பால்", unit: "1 Liter bottle", price: 540.0, category: "Dairy & Eggs", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80", stock: 85 },
  { id: "prod-004", name: "Anchor Full Cream Milk Powder", nameTa: "ஆங்கர் பால் மா", unit: "400 g pack", price: 1180.0, category: "Dairy & Eggs", img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80", stock: 120 },
  { id: "prod-005", name: "Batticaloa Lagoon Jumbo Prawns", nameTa: "மட்டக்களப்பு களப்பு இறால்", unit: "500 g pack", price: 1650.0, category: "Lagoon & Seafood", img: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=400&q=80", stock: 45 },
  { id: "prod-006", name: "Eastern Fresh Lagoon White Pomfret", nameTa: "கிழக்கு களப்பு வௌ்ளை வௌ்வால் மீன்", unit: "1 kg whole", price: 2100.0, category: "Lagoon & Seafood", img: "https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=400&q=80", stock: 30 },
  { id: "prod-007", name: "Batticaloa Green Chillies & Kochchi", nameTa: "மட்டக்களப்பு பச்சை மிளகாய்", unit: "250 g pack", price: 190.0, category: "Vegetables & Greens", img: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80", stock: 95 },
  { id: "prod-008", name: "Eastern Sweet Papaya (Red Lady)", nameTa: "கிழக்கு பப்பாசி பழம்", unit: "1.2 kg fruit", price: 280.0, category: "Fresh Fruits", img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=400&q=80", stock: 75 },
  { id: "prod-009", name: "Baraka Pure Coconut Oil", nameTa: "பராக்கா தூய தேங்காய் எண்ணெய்", unit: "750 ml bottle", price: 890.0, category: "Cooking Essentials", img: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80", stock: 110 },
  { id: "prod-010", name: "Munchee Super Cream Cracker", nameTa: "மஞ்சீ கிரீம் கிரக்கர்", unit: "500 g pack", price: 420.0, category: "Snacks & Biscuits", img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80", stock: 150 }
];

// 4. Initial Cart
let cart = [
  { productId: "prod-001", quantity: 1 },
  { productId: "prod-003", quantity: 2 },
  { productId: "prod-005", quantity: 1 }
];

// 5. Rider & Admin Simulation State
let riderOnline = true;
let riderHasActiveDelivery = true;

// Helper: Format Currency
function formatLKR(amount) {
  return "LKR " + Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper: Safe In-DOM Toast Notification (Replaces window.alert)
function showToast(message, icon = "✨") {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMessage");
  const iconEl = document.getElementById("toastIcon");
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// Language Switcher
function setAppLanguage(lang) {
  appLang = lang;
  const btnEn = document.getElementById("langBtnEn");
  const btnTa = document.getElementById("langBtnTa");
  if (btnEn && btnTa) {
    if (lang === 'en') {
      btnEn.style.background = '#168BFF';
      btnEn.style.color = 'white';
      btnTa.style.background = 'white';
      btnTa.style.color = '#10243B';
    } else {
      btnTa.style.background = '#168BFF';
      btnTa.style.color = 'white';
      btnEn.style.background = 'white';
      btnEn.style.color = '#10243B';
    }
  }
  showToast(lang === 'en' ? "Language set to English" : "மொழி தமிழ் தெரிவு செய்யப்பட்டது", "🌐");
  renderScreen();
}

// Platform Switcher
function switchApp(app) {
  activeApp = app;
  document.querySelectorAll(".suite-tab").forEach(tab => tab.classList.remove("active"));
  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add("active");
  }

  const mobileSim = document.getElementById("mobileSimulator");
  const webView = document.getElementById("webDashboardView");

  if (app === "admin-web") {
    mobileSim.style.display = "none";
    webView.style.display = "flex";
    return;
  }

  mobileSim.style.display = "flex";
  webView.style.display = "none";

  if (app === "customer") {
    document.getElementById("activeAppBadge").textContent = "CUSTOMER MOBILE APP (FLUTTER)";
    document.getElementById("activeAppTitle").textContent = "Grocery Shopping Experience";
    document.getElementById("activeAppDesc").textContent = "Browse authentic Batticaloa groceries, managed cart in LKR, Cash on Delivery (COD) checkout, and simulated real-time rider tracking.";
    document.getElementById("demoRoleText").textContent = "Customer: Kajan Sivanesan (+94 77 123 4567 • Puliyanthivu)";
    activeScreen = "home";
  } else if (app === "rider") {
    document.getElementById("activeAppBadge").textContent = "RIDER MOBILE APP (FLUTTER)";
    document.getElementById("activeAppTitle").textContent = "Fleet & Dispatch Operations";
    document.getElementById("activeAppDesc").textContent = "Online/offline status toggle, order dispatch alert, pickup fulfillment from Batticaloa hubs, turn-by-turn navigation, and cash collection.";
    document.getElementById("demoRoleText").textContent = "Rider: Kajan Sivanesan (Motorcycle EP BDF-4821 • Batticaloa)";
    activeScreen = "rider-dashboard";
  } else if (app === "admin-mobile") {
    document.getElementById("activeAppBadge").textContent = "ADMIN MOBILE APP (FLUTTER)";
    document.getElementById("activeAppTitle").textContent = "Store Supervision & Inventory";
    document.getElementById("activeAppDesc").textContent = "Overview of all 10 Batticaloa stores, 22 live orders stream, multi-store inventory rebalancing, and 15-rider fleet roster.";
    document.getElementById("demoRoleText").textContent = "Store Admin: Tharshan Yogarajah (Batticaloa Town Hub)";
    activeScreen = "admin-dashboard";
  }

  renderWorkflowButtons();
  renderScreen();
}

// Render Workflow Quick Jump Buttons
function renderWorkflowButtons() {
  const container = document.getElementById("workflowStepButtons");
  if (!container) return;

  let steps = [];
  if (activeApp === "customer") {
    steps = [
      { id: "home", label: "Home Screen" },
      { id: "categories", label: "Catalog Departments" },
      { id: "cart", label: "Shopping Basket" },
      { id: "checkout", label: "Checkout & COD" },
      { id: "tracking", label: "Live Rider Tracking" },
      { id: "profile", label: "Customer Profile" }
    ];
  } else if (activeApp === "rider") {
    steps = [
      { id: "rider-dashboard", label: "Rider Shift Hub" },
      { id: "incoming-order", label: "New Dispatch Alert" },
      { id: "navigation-map", label: "Turn-by-Turn GPS" },
      { id: "rider-earnings", label: "Shift Earnings" }
    ];
  } else if (activeApp === "admin-mobile") {
    steps = [
      { id: "admin-dashboard", label: "10-Store KPIs" },
      { id: "admin-orders", label: "Live Orders Stream" },
      { id: "admin-stock", label: "10-Hub Stock Matrix" },
      { id: "admin-stores", label: "Batticaloa Hubs" }
    ];
  }

  container.innerHTML = steps.map(s => `
    <button type="button" class="step-btn ${activeScreen === s.id ? 'active' : ''}" onclick="setScreen('${s.id}')">
      ${s.label}
    </button>
  `).join('');
}

function setScreen(screenId) {
  activeScreen = screenId;
  renderWorkflowButtons();
  renderScreen();
}

// Main Screen Rendering Engine
function renderScreen() {
  const canvas = document.getElementById("deviceScreen");
  if (!canvas) return;

  if (activeApp === "customer") {
    renderCustomerApp(canvas);
  } else if (activeApp === "rider") {
    renderRiderApp(canvas);
  } else if (activeApp === "admin-mobile") {
    renderAdminApp(canvas);
  }
}

// --------------------------------------------------------------------------
// 1. CUSTOMER MOBILE APP SCREENS
// --------------------------------------------------------------------------
function renderCustomerApp(canvas) {
  let content = '';
  const currentStore = BRANCHES.find(b => b.id === activeStoreId) || BRANCHES[0];

  if (activeScreen === "home") {
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <!-- Top bar with Store Selector -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <div style="font-size: 10px; color: var(--color-secondary-text); font-weight: bold; text-transform: uppercase;">
              ${appLang === 'ta' ? 'விநியோக கிளை' : 'DELIVERING FROM'}
            </div>
            <div style="font-size: 12px; font-weight: 800; color: var(--color-dark-navy); display: flex; align-items: center; gap: 4px; cursor: pointer;" onclick="promptStorePicker()">
              ${currentStore.name} ▾
            </div>
          </div>
          <div style="width: 34px; height: 34px; border-radius: 50%; background: #168BFF; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 4px 10px rgba(22,139,255,0.3);">
            KS
          </div>
        </div>

        <!-- Hero Card (Neon Ice Glass) -->
        <div style="background: linear-gradient(135deg, #168BFF 0%, #0866CC 100%); color: white; padding: 16px; border-radius: 20px; box-shadow: 0 8px 24px rgba(22,139,255,0.25); margin-bottom: 16px; position: relative; overflow: hidden;">
          <div style="font-size: 9px; font-weight: 800; letter-spacing: 0.08em; opacity: 0.9;">
            ${appLang === 'ta' ? 'மட்டக்களப்பு நுகர்வோர் சேவை' : 'BATTICALOA DISTRICT COLD-CHAIN'}
          </div>
          <h3 style="font-size: 15px; font-weight: 800; margin: 4px 0 6px;">
            ${appLang === 'ta' ? '30-45 நிமிடங்களில் நேரடி வீட்டு விநியோகம்' : 'Fresh Farm & Lagoon Groceries in 35-45 Mins'}
          </h3>
          <p style="font-size: 11px; opacity: 0.9; margin: 0;">
            ${appLang === 'ta' ? 'மட்டக்களப்பு வயல்வெளி அரிசி மற்றும் புதிய மீன்கள்' : 'Sourced daily from Batticaloa farmers and lagoon fisheries.'}
          </p>
        </div>

        <!-- Featured Products -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="font-size: 13px; color: var(--color-dark-navy);">
            ${appLang === 'ta' ? 'பிரபலமான மட்டக்களப்பு பொருட்கள்' : 'Popular Batticaloa Groceries'}
          </strong>
          <span style="font-size: 11px; color: #168BFF; font-weight: bold; cursor: pointer;" onclick="setScreen('categories')">
            ${appLang === 'ta' ? 'அனைத்தும்' : 'View All'}
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${PRODUCTS.slice(0, 5).map(p => `
            <div style="display: flex; align-items: center; gap: 12px; background: white; padding: 10px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
              <img src="${p.img}" alt="${p.name}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 10px;">
              <div style="flex: 1;">
                <div style="font-size: 12px; font-weight: bold; color: var(--color-dark-navy);">
                  ${appLang === 'ta' ? p.nameTa : p.name}
                </div>
                <div style="font-size: 10px; color: var(--color-secondary-text);">${p.unit} • ${p.category}</div>
                <div style="font-size: 12px; font-weight: 800; color: #168BFF; margin-top: 2px;">${formatLKR(p.price)}</div>
              </div>
              <button type="button" onclick="addToCart('${p.id}')" style="background: #EAF3FF; color: #168BFF; border: none; font-weight: bold; font-size: 11px; padding: 6px 12px; border-radius: 9999px; cursor: pointer; transition: all 0.2s;">
                + Add
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (activeScreen === "categories") {
    const cats = [
      { name: "Rice, Flour & Grains", nameTa: "அரிசி மற்றும் தானியங்கள்", count: "10 Items", icon: "🌾" },
      { name: "Fresh Vegetables", nameTa: "புதிய காய்கறிகள்", count: "12 Items", icon: "🥦" },
      { name: "Lagoon & Seafood", nameTa: "களப்பு மீன்கள்", count: "6 Items", icon: "🦐" },
      { name: "Dairy & Farm Eggs", nameTa: "பால் மற்றும் முட்டை", count: "8 Items", icon: "🥛" },
      { name: "Fresh Fruits", nameTa: "புதிய பழங்கள்", count: "8 Items", icon: "🍌" },
      { name: "Cooking Essentials", nameTa: "சமையல் பொருட்கள்", count: "11 Items", icon: "🥥" },
      { name: "Snacks & Biscuits", nameTa: "சிற்றுண்டிகள்", count: "9 Items", icon: "🍪" },
      { name: "Household Essentials", nameTa: "வீட்டுப் பராமரிப்பு", count: "14 Items", icon: "✨" }
    ];
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px; color: var(--color-dark-navy);">
          ${appLang === 'ta' ? 'பொருட்கள் பிரிவுகள்' : 'Grocery Departments'}
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${cats.map(c => `
            <div style="background: white; padding: 14px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 2px 8px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="setScreen('home')">
              <span style="font-size: 24px;">${c.icon}</span>
              <div>
                <div style="font-size: 11px; font-weight: bold; color: var(--color-dark-navy); line-height: 1.2;">
                  ${appLang === 'ta' ? c.nameTa : c.name}
                </div>
                <div style="font-size: 9px; color: var(--color-secondary-text); margin-top: 2px;">${c.count}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (activeScreen === "cart") {
    const subtotal = cart.reduce((sum, item) => {
      const p = PRODUCTS.find(pr => pr.id === item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);
    const delivery = 250.0;
    const total = subtotal + delivery;

    content = `
      <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px; color: var(--color-dark-navy);">
          ${appLang === 'ta' ? 'கொள்முதல் கூடை' : 'Shopping Basket'} (${cart.length} items)
        </h3>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          ${cart.map(item => {
            const p = PRODUCTS.find(pr => pr.id === item.productId);
            if (!p) return '';
            return `
              <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 12px; font-weight: bold; color: var(--color-dark-navy);">
                    ${appLang === 'ta' ? p.nameTa : p.name}
                  </div>
                  <div style="font-size: 11px; color: #168BFF; font-weight: bold;">${formatLKR(p.price)} × ${item.quantity}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <button type="button" onclick="modifyQty('${p.id}', -1)" style="width: 24px; height: 24px; border-radius: 50%; border: none; background: #EAF3FF; color: #168BFF; font-weight: bold; cursor: pointer;">-</button>
                  <span style="font-size: 12px; font-weight: bold;">${item.quantity}</span>
                  <button type="button" onclick="modifyQty('${p.id}', 1)" style="width: 24px; height: 24px; border-radius: 50%; border: none; background: #EAF3FF; color: #168BFF; font-weight: bold; cursor: pointer;">+</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="background: white; padding: 14px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); margin-top: 14px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>${appLang === 'ta' ? 'உப மொத்தம்' : 'Subtotal'}</span><strong>${formatLKR(subtotal)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>${appLang === 'ta' ? 'விநியோக கட்டணம்' : 'Delivery Fee'} (${currentStore.name})</span><strong>${formatLKR(delivery)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #168BFF; border-top: 1px dashed #E2E8F0; padding-top: 6px;">
            <span>${appLang === 'ta' ? 'மொத்த தொகை' : 'Grand Total'}</span><strong>${formatLKR(total)}</strong>
          </div>
        </div>

        <button type="button" onclick="setScreen('checkout')" style="width: 100%; margin-top: 12px; background: #168BFF; color: white; border: none; padding: 12px; border-radius: 9999px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(22,139,255,0.3);">
          ${appLang === 'ta' ? 'கொடுப்பனவுக்கு செல் (COD)' : 'Proceed to Checkout (COD)'}
        </button>
      </div>
    `;
  } else if (activeScreen === "checkout") {
    content = `
      <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px; color: var(--color-dark-navy);">
          ${appLang === 'ta' ? 'செக்அவுட் மற்றும் முகவரி' : 'Checkout & Delivery Details'}
        </h3>
        
        <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: bold; color: #168BFF; margin-bottom: 4px; text-transform: uppercase;">
            ${appLang === 'ta' ? 'விநியோகிக்கும் BuyMe கிளை' : 'FULFILLMENT BRANCH'}
          </div>
          <div style="font-size: 12px; font-weight: bold;">${currentStore.name}</div>
          <div style="font-size: 10px; color: var(--color-secondary-text);">${currentStore.address}</div>
        </div>

        <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: bold; color: #168BFF; margin-bottom: 4px; text-transform: uppercase;">
            ${appLang === 'ta' ? 'சேருமிடம் முகவரி' : 'DELIVERY ADDRESS'}
          </div>
          <div style="font-size: 12px; font-weight: bold;">14/2 Central Road, Puliyanthivu, Batticaloa</div>
          <div style="font-size: 10px; color: var(--color-secondary-text);">Customer: Kajan Sivanesan (+94 77 123 4567)</div>
        </div>

        <div style="background: #ECFDF5; border: 1px solid rgba(16,185,129,0.3); padding: 12px; border-radius: 14px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: #10B981;">
            ${appLang === 'ta' ? 'பணம் செலுத்தும் முறை' : 'Payment Method'}
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #065F46;">
            ${appLang === 'ta' ? 'நேரடி பணக்கொடுப்பனவு (COD)' : 'Cash on Delivery (LKR)'}
          </div>
          <div style="font-size: 10px; color: #047857; margin-top: 2px;">
            ${appLang === 'ta' ? 'பொருட்கள் வீட்டுக்கு வரும் போது ரைடரிடம் பணத்தை வழங்கவும்.' : 'Pay our rider upon doorstep receipt of your grocery items.'}
          </div>
        </div>

        <button type="button" onclick="placeSimulatedOrder()" style="margin-top: auto; width: 100%; background: #10B981; color: white; border: none; padding: 12px; border-radius: 9999px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
          ${appLang === 'ta' ? 'ஓடரை உறுதிசெய் (#DMB-901)' : 'Confirm Order (#DMB-901)'}
        </button>
      </div>
    `;
  } else if (activeScreen === "tracking") {
    content = `
      <div style="padding: 16px; flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
        <span style="font-size: 10px; background: #EAF3FF; color: #168BFF; padding: 3px 8px; border-radius: 9999px; font-weight: bold; display: inline-block; width: max-content;">
          ORDER #DMB-2026-901
        </span>
        <h3 style="font-size: 17px; font-weight: 800; margin: 6px 0 2px; color: var(--color-dark-navy);">
          ${appLang === 'ta' ? 'விநியோகத்தில் உள்ளது' : 'Out for Express Delivery'}
        </h3>
        <p style="font-size: 11px; color: #10B981; font-weight: bold; margin: 0 0 12px;">
          ${appLang === 'ta' ? 'மதிப்பிடப்பட்ட நேரம்: 14 நிமிடங்கள்' : 'Estimated Arrival: 14 Mins • Puliyanthivu'}
        </p>

        <!-- Simulated Visual Map Canvas (Puliyanthivu Batticaloa) -->
        <div style="background: #EAF3FF; border: 1px solid rgba(22,139,255,0.25); border-radius: 18px; height: 170px; margin-bottom: 14px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(22,139,255,0.1);">
          <div style="text-align: center;">
            <div style="font-size: 32px; animation: bounce 1.8s infinite;">🛵</div>
            <div style="font-size: 12px; font-weight: 800; color: #10243B; margin-top: 4px;">
              Rider: Niroshan Tharmalingam
            </div>
            <div style="font-size: 10px; color: #168BFF; font-weight: bold;">
              EP BDF-4821 • Bar Road, Puliyanthivu
            </div>
          </div>
        </div>

        <div style="background: white; padding: 14px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span>${appLang === 'ta' ? 'செலுத்த வேண்டிய தொகை' : 'Cash on Delivery Payable'}</span>
            <strong style="color: #168BFF; font-size: 13px;">LKR 5,190.00</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>${appLang === 'ta' ? 'விநியோக கிளை' : 'Dispatched Hub'}</span>
            <strong>${currentStore.name}</strong>
          </div>
        </div>
      </div>
    `;
  } else if (activeScreen === "profile") {
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="width: 58px; height: 58px; border-radius: 50%; background: #168BFF; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin: 0 auto 8px; box-shadow: 0 4px 12px rgba(22,139,255,0.3);">
            KS
          </div>
          <h3 style="font-size: 15px; font-weight: 800; color: var(--color-dark-navy); margin: 0;">Kajan Sivanesan</h3>
          <p style="font-size: 11px; color: var(--color-secondary-text); margin: 2px 0 0;">
            +94 77 123 4567 • Puliyanthivu, Batticaloa
          </p>
        </div>

        <div style="background: white; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); overflow: hidden; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="padding: 12px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between;">
            <span>${appLang === 'ta' ? 'வெகுமதி புள்ளிகள்' : 'BuyMe Loyalty Points'}</span>
            <strong style="color: #F59E0B;">⭐ 420 pts</strong>
          </div>
          <div style="padding: 12px; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between;">
            <span>${appLang === 'ta' ? 'மொத்த ஓடர்கள்' : 'Total Orders Placed'}</span>
            <strong>18 Orders</strong>
          </div>
          <div style="padding: 12px; border-bottom: 1px solid #F1F5F9; cursor: pointer;" onclick="setScreen('tracking')">
            <span>${appLang === 'ta' ? 'தற்போதைய ஓடரை பின்தொடர்' : 'Track Active Order (#DMB-901)'}</span>
          </div>
          <div style="padding: 12px; color: #168BFF; font-weight: bold; cursor: pointer;" onclick="setAppLanguage(appLang === 'en' ? 'ta' : 'en')">
            <span>🌐 Switch Language (English / தமிழ்)</span>
          </div>
          <div style="padding: 12px; color: #EF4444; font-weight: bold; cursor: pointer;" onclick="showToast('Signed out of demo session', '🚪')">
            ${appLang === 'ta' ? 'வெளியேறு' : 'Sign Out'}
          </div>
        </div>
      </div>
    `;
  }

  // Mobile Bottom Tab Bar
  const bottomBar = `
    <div style="margin-top: auto; background: white; border-top: 1px solid rgba(0,0,0,0.06); padding: 8px 14px; display: flex; justify-content: space-around; font-size: 10px; font-weight: bold; color: var(--color-secondary-text);">
      <span style="color: ${activeScreen === 'home' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('home')">🏠 Home</span>
      <span style="color: ${activeScreen === 'categories' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('categories')">📦 Catalog</span>
      <span style="color: ${activeScreen === 'cart' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('cart')">🛒 Cart (${cart.length})</span>
      <span style="color: ${activeScreen === 'tracking' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('tracking')">🛵 Track</span>
      <span style="color: ${activeScreen === 'profile' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('profile')">👤 Profile</span>
    </div>
  `;

  canvas.innerHTML = content + bottomBar;
}

// --------------------------------------------------------------------------
// 2. RIDER MOBILE APP SCREENS
// --------------------------------------------------------------------------
function renderRiderApp(canvas) {
  let content = '';

  if (activeScreen === "rider-dashboard") {
    content = `
      <div style="padding: 16px; flex: 1; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <div style="font-size: 10px; color: var(--color-secondary-text); font-weight: bold;">RIDER SHIFT TELEMETRY</div>
            <div style="font-size: 13px; font-weight: 800; color: ${riderOnline ? '#10B981' : '#64748B'};">
              ● ${riderOnline ? 'ONLINE • BATTICALOA FLEET' : 'OFFLINE'}
            </div>
          </div>
          <button type="button" onclick="toggleRiderOnline()" style="background: ${riderOnline ? '#ECFDF5' : '#F1F5F9'}; color: ${riderOnline ? '#10B981' : '#64748B'}; border: 1px solid ${riderOnline ? '#A7F3D0' : '#CBD5E1'}; border-radius: 9999px; padding: 4px 10px; font-size: 10px; font-weight: bold; cursor: pointer;">
            Toggle Status
          </button>
        </div>

        <!-- Active Delivery Card -->
        <div style="background: white; border: 1px solid rgba(22,139,255,0.3); padding: 16px; border-radius: 20px; box-shadow: 0 4px 16px rgba(22,139,255,0.08); margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 800;">ORDER #DMB-2026-901</span>
            <span style="background: #168BFF; color: white; font-size: 9px; font-weight: bold; padding: 2px 7px; border-radius: 9999px;">ACTIVE DISPATCH</span>
          </div>

          <div style="margin: 12px 0; font-size: 11px;">
            <div style="margin-bottom: 8px;">
              <span style="color: #168BFF; font-weight: bold;">PICKUP HUB:</span>
              <div style="font-weight: bold; color: #10243B;">BuyMe Batticaloa Town Hub</div>
              <div style="color: #64748B; font-size: 10px;">14/2 Central Road, Puliyanthivu</div>
            </div>
            <div>
              <span style="color: #10B981; font-weight: bold;">DROPOFF:</span>
              <div style="font-weight: bold; color: #10243B;">Kajan Sivanesan</div>
              <div style="color: #64748B; font-size: 10px;">Koddaimunai Lane, Puliyanthivu</div>
            </div>
          </div>

          <div style="background: #EAF3FF; padding: 10px; border-radius: 12px; font-size: 11px; display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span>Collect Cash (COD):</span><strong style="color: #168BFF;">LKR 5,190.00</strong>
          </div>

          <div style="display: flex; gap: 8px;">
            <button type="button" onclick="setScreen('navigation-map')" style="flex: 1; background: #168BFF; color: white; border: none; padding: 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; cursor: pointer;">
              Open GPS Map
            </button>
            <button type="button" onclick="confirmRiderDelivery()" style="flex: 1; background: #10B981; color: white; border: none; padding: 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; cursor: pointer;">
              Confirm Delivered
            </button>
          </div>
        </div>

        <!-- Shift Stats -->
        <h4 style="font-size: 12px; font-weight: 800; margin-bottom: 8px;">Today's Batticaloa Shift</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="color: #64748B; font-size: 10px;">Completed</div>
            <strong style="font-size: 14px; color: #168BFF;">6 Deliveries</strong>
          </div>
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="color: #64748B; font-size: 10px;">Shift Earnings</div>
            <strong style="font-size: 14px; color: #10B981;">LKR 4,850.00</strong>
          </div>
        </div>
      </div>
    `;
  } else if (activeScreen === "incoming-order") {
    content = `
      <div style="padding: 16px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <div style="width: 68px; height: 68px; border-radius: 50%; background: #EAF3FF; color: #168BFF; display: flex; align-items: center; justify-content: center; font-size: 30px; margin: 0 auto 12px;">📦</div>
        <span style="background: #168BFF; color: white; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; width: max-content; margin: 0 auto 8px;">NEW DISPATCH REQUEST</span>
        <h3 style="font-size: 18px; font-weight: 800; color: #10243B; margin: 0;">Order #DMB-902</h3>
        <p style="font-size: 12px; color: #64748B; margin: 4px 0 0;">BuyMe Kattankudy Hub (3 items)</p>
        <p style="font-size: 14px; font-weight: 800; color: #10B981; margin: 12px 0;">Est. Rider Fee: LKR 400.00</p>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="button" onclick="setScreen('rider-dashboard')" style="flex: 1; background: #F1F5F9; color: #64748B; border: none; padding: 12px; border-radius: 9999px; font-weight: bold; cursor: pointer;">
            Decline
          </button>
          <button type="button" onclick="acceptRiderOrder()" style="flex: 1; background: #168BFF; color: white; border: none; padding: 12px; border-radius: 9999px; font-weight: bold; cursor: pointer;">
            Accept Order
          </button>
        </div>
      </div>
    `;
  } else if (activeScreen === "navigation-map") {
    content = `
      <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 8px;">Batticaloa Navigation Route</h3>
        <div style="background: #0F172A; color: white; border-radius: 16px; padding: 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">↱</div>
          <div>
            <div style="font-size: 13px; font-weight: bold;">In 280 meters</div>
            <div style="font-size: 10px; color: #94A3B8;">Turn right onto Central Road, Puliyanthivu</div>
          </div>
        </div>

        <div style="flex: 1; background: #E2E8F0; border-radius: 16px; display: flex; align-items: center; justify-content: center; position: relative;">
          <div style="text-align: center;">
            <div style="font-size: 28px;">🛵</div>
            <div style="font-size: 11px; font-weight: bold; margin-top: 4px;">Speed: 42 km/h</div>
            <div style="font-size: 10px; color: #64748B;">Route: Bar Rd ➔ Puliyanthivu Central</div>
          </div>
        </div>

        <button type="button" onclick="setScreen('rider-dashboard')" style="width: 100%; margin-top: 12px; background: #168BFF; color: white; border: none; padding: 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; cursor: pointer;">
          Back to Dispatch Details
        </button>
      </div>
    `;
  } else if (activeScreen === "rider-earnings") {
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px;">Shift Earnings & Cash</h3>
        <div style="background: linear-gradient(135deg, #168BFF 0%, #0866CC 100%); color: white; padding: 20px; border-radius: 20px; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(22,139,255,0.25);">
          <span style="font-size: 10px; opacity: 0.9;">TOTAL EARNINGS (TODAY)</span>
          <h2 style="font-size: 24px; font-weight: 800; margin: 4px 0;">LKR 4,850.00</h2>
          <span style="font-size: 10px; opacity: 0.9;">Cash on Delivery collected: LKR 12,410.00</span>
        </div>

        <div style="background: white; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); padding: 14px; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Completed Deliveries</span><strong>6 trips</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>On-Time Delivery Rate</span><strong style="color: #10B981;">100%</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Customer Rating</span><strong>⭐ 4.96 / 5.0</strong>
          </div>
        </div>
      </div>
    `;
  }

  // Rider Bottom Navigation
  const bottomBar = `
    <div style="margin-top: auto; background: white; border-top: 1px solid rgba(0,0,0,0.06); padding: 8px 14px; display: flex; justify-content: space-around; font-size: 10px; font-weight: bold; color: var(--color-secondary-text);">
      <span style="color: ${activeScreen === 'rider-dashboard' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('rider-dashboard')">🛵 Dispatch</span>
      <span style="color: ${activeScreen === 'incoming-order' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('incoming-order')">🔔 Incoming</span>
      <span style="color: ${activeScreen === 'navigation-map' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('navigation-map')">🗺️ GPS</span>
      <span style="color: ${activeScreen === 'rider-earnings' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('rider-earnings')">💰 Earnings</span>
    </div>
  `;

  canvas.innerHTML = content + bottomBar;
}

// --------------------------------------------------------------------------
// 3. ADMIN MOBILE APP SCREENS
// --------------------------------------------------------------------------
function renderAdminApp(canvas) {
  let content = '';

  if (activeScreen === "admin-dashboard") {
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <div style="background: linear-gradient(135deg, #168BFF 0%, #0866CC 100%); color: white; padding: 18px; border-radius: 20px; margin-bottom: 14px; box-shadow: 0 4px 16px rgba(22,139,255,0.25);">
          <span style="font-size: 10px; opacity: 0.9;">DISTRICT REVENUE (ALL 10 BATTICALOA HUBS)</span>
          <h2 style="font-size: 22px; font-weight: 800; margin: 4px 0;">LKR 184,520.00</h2>
          <span style="font-size: 10px; opacity: 0.9;">+24.6% vs last week • 22 Orders Active</span>
        </div>

        <h4 style="font-size: 12px; font-weight: 800; margin-bottom: 8px;">Network Operational Health</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-bottom: 14px;">
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="color: #64748B; font-size: 10px;">Active Orders</div>
            <strong style="font-size: 15px; color: #168BFF;">22 Orders</strong>
          </div>
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="color: #64748B; font-size: 10px;">Riders Online</div>
            <strong style="font-size: 15px; color: #10B981;">15 Active</strong>
          </div>
        </div>

        <h4 style="font-size: 12px; font-weight: 800; margin-bottom: 8px;">Top Batticaloa Hubs</h4>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
          <div style="background: white; padding: 10px; border-radius: 12px; display: flex; justify-content: space-between;">
            <span>BuyMe Batticaloa Town</span><strong style="color: #10B981;">8 Orders</strong>
          </div>
          <div style="background: white; padding: 10px; border-radius: 12px; display: flex; justify-content: space-between;">
            <span>BuyMe Kattankudy Hub</span><strong style="color: #168BFF;">5 Orders</strong>
          </div>
          <div style="background: white; padding: 10px; border-radius: 12px; display: flex; justify-content: space-between;">
            <span>BuyMe Valaichenai Hub</span><strong style="color: #168BFF;">4 Orders</strong>
          </div>
        </div>
      </div>
    `;
  } else if (activeScreen === "admin-orders") {
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px;">Live Order Dispatch Stream</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;">
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between;">
              <strong>#DMB-901 • LKR 5,190.00</strong>
              <span style="color: #168BFF; font-weight: bold;">Out for delivery</span>
            </div>
            <div style="color: #64748B; margin-top: 2px;">Batticaloa Town • Rider: Kajan S.</div>
          </div>
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between;">
              <strong>#DMB-902 • LKR 2,950.00</strong>
              <span style="color: #F59E0B; font-weight: bold;">Preparing</span>
            </div>
            <div style="color: #64748B; margin-top: 2px;">Kattankudy • Assigning Rider</div>
          </div>
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between;">
              <strong>#DMB-903 • LKR 3,850.00</strong>
              <span style="color: #10B981; font-weight: bold;">Delivered</span>
            </div>
            <div style="color: #64748B; margin-top: 2px;">Eravur • Rider: Tharshan</div>
          </div>
        </div>
      </div>
    `;
  } else if (activeScreen === "admin-stock") {
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px;">Store Stock Rebalancing</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;">
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="font-weight: bold;">Batticaloa Red Raw Rice (5 kg)</div>
            <div style="color: #64748B; margin-top: 2px;">Batti Town: 185 | Kattankudy: 120 | Eravur: 90</div>
          </div>
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="font-weight: bold;">Lagoon Jumbo Prawns (500 g)</div>
            <div style="color: #EF4444; font-weight: bold; margin-top: 2px;">Batti Town: 45 | Oddamavadi: 12 (LOW STOCK)</div>
          </div>
          <div style="background: white; padding: 12px; border-radius: 14px; border: 1px solid rgba(0,0,0,0.05);">
            <div style="font-weight: bold;">Ambewela Fresh Milk (1L)</div>
            <div style="color: #64748B; margin-top: 2px;">Batti Town: 85 | Chenkalady: 40 | Kiran: 25</div>
          </div>
        </div>
      </div>
    `;
  } else if (activeScreen === "admin-stores") {
    content = `
      <div style="padding: 16px; overflow-y: auto; flex: 1;">
        <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px;">10 Batticaloa Superstore Hubs</h3>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px;">
          ${BRANCHES.map(b => `
            <div style="background: white; padding: 10px 12px; border-radius: 12px; border-left: 4px solid #10B981; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
              <div style="font-weight: bold; color: #10243B;">${b.name}</div>
              <div style="color: #64748B; font-size: 10px;">${b.address} • Mgr: ${b.manager}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Admin Bottom Navigation
  const bottomBar = `
    <div style="margin-top: auto; background: white; border-top: 1px solid rgba(0,0,0,0.06); padding: 8px 14px; display: flex; justify-content: space-around; font-size: 10px; font-weight: bold; color: var(--color-secondary-text);">
      <span style="color: ${activeScreen === 'admin-dashboard' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('admin-dashboard')">📊 Stats</span>
      <span style="color: ${activeScreen === 'admin-orders' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('admin-orders')">🛍️ Orders</span>
      <span style="color: ${activeScreen === 'admin-stock' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('admin-stock')">📦 Stock</span>
      <span style="color: ${activeScreen === 'admin-stores' ? '#168BFF' : 'inherit'}; cursor: pointer;" onclick="setScreen('admin-stores')">🏬 Hubs</span>
    </div>
  `;

  canvas.innerHTML = content + bottomBar;
}

// User Actions
function addToCart(productId) {
  const item = cart.find(c => c.productId === productId);
  if (item) {
    item.quantity++;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  const p = PRODUCTS.find(pr => pr.id === productId);
  showToast(`Added ${p ? p.name : 'item'} to cart!`, "🛒");
  renderScreen();
}

function modifyQty(productId, delta) {
  const index = cart.findIndex(c => c.productId === productId);
  if (index > -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  renderScreen();
}

function placeSimulatedOrder() {
  showToast("Order #DMB-2026-901 confirmed via Cash on Delivery!", "✅");
  setScreen("tracking");
}

function toggleRiderOnline() {
  riderOnline = !riderOnline;
  showToast(riderOnline ? "Rider is now ONLINE" : "Rider is now OFFLINE", "🛵");
  renderScreen();
}

function confirmRiderDelivery() {
  showToast("Delivery complete! LKR 400.00 fee credited to your shift.", "💰");
}

function acceptRiderOrder() {
  showToast("Dispatch accepted! Route navigation loaded.", "📍");
  setScreen("navigation-map");
}

function promptStorePicker() {
  const storeNames = BRANCHES.map((b, i) => `${i + 1}. ${b.name}`).join("\n");
  const nextStoreIndex = (BRANCHES.findIndex(b => b.id === activeStoreId) + 1) % BRANCHES.length;
  activeStoreId = BRANCHES[nextStoreIndex].id;
  const sel = document.getElementById("suiteStoreSelect");
  if (sel) sel.value = activeStoreId;
  showToast(`Switched active store to ${BRANCHES[nextStoreIndex].name}`, "🏬");
  renderScreen();
}

function onSuiteStoreChange(storeId) {
  activeStoreId = storeId;
  const b = BRANCHES.find(br => br.id === storeId);
  showToast(`Switched to: ${b ? b.name : storeId}`, "🏬");
  renderScreen();
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  renderWorkflowButtons();
  renderScreen();
});
