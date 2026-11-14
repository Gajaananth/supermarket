/**
 * BuyMe Supermarket — Design System Showcase Client Script
 * Batticaloa District, Eastern Province, Sri Lanka
 * Handles live components preview, local cart state, modern dialog, and reactive filters.
 */

// Sample seeded products for visual preview (synchronized with shared/data/products.json)
const PRODUCTS = [
  {
    id: "prod-001",
    name: "Eastern Star Batticaloa Red Raw Rice",
    categoryId: "cat-003",
    categoryName: "Rice & Grains",
    unit: "5 kg bag",
    price: 1250.00,
    originalPrice: 1400.00,
    discountPercent: 10,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 185
  },
  {
    id: "prod-002",
    name: "Anchor Full Cream Milk Powder",
    categoryId: "cat-002",
    categoryName: "Dairy & Eggs",
    unit: "400 g pack",
    price: 1180.00,
    originalPrice: 1250.00,
    discountPercent: 6,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 120
  },
  {
    id: "prod-003",
    name: "Ambewela Farm Fresh Milk",
    categoryId: "cat-002",
    categoryName: "Dairy & Eggs",
    unit: "1 Liter bottle",
    price: 540.00,
    originalPrice: 540.00,
    discountPercent: 0,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 45
  },
  {
    id: "prod-005",
    name: "Farm Fresh Grade A White Eggs",
    categoryId: "cat-002",
    categoryName: "Dairy & Eggs",
    unit: "Pack of 10",
    price: 520.00,
    originalPrice: 560.00,
    discountPercent: 7,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 90
  },
  {
    id: "prod-006",
    name: "Nuwara Eliya Fresh Carrots",
    categoryId: "cat-001",
    categoryName: "Fresh Produce",
    unit: "500 g",
    price: 280.00,
    originalPrice: 320.00,
    discountPercent: 13,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 70
  },
  {
    id: "prod-009",
    name: "Baraka Pure Coconut Oil",
    categoryId: "cat-004",
    categoryName: "Cooking Essentials",
    unit: "750 ml bottle",
    price: 890.00,
    originalPrice: 980.00,
    discountPercent: 9,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 40
  },
  {
    id: "prod-010",
    name: "Munchee Super Cream Cracker",
    categoryId: "cat-005",
    categoryName: "Snacks & Biscuits",
    unit: "500 g pack",
    price: 420.00,
    originalPrice: 460.00,
    discountPercent: 9,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 150
  },
  {
    id: "prod-012",
    name: "Watawala Ceylon Tea Dust 1",
    categoryId: "cat-004",
    categoryName: "Cooking Essentials",
    unit: "400 g pack",
    price: 680.00,
    originalPrice: 750.00,
    discountPercent: 9,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=600&q=80",
    inStock: true,
    stockCount: 100
  }
];

// Local Cart State
let cart = [
  { productId: "prod-001", quantity: 1 },
  { productId: "prod-003", quantity: 2 }
];

let selectedCategoryId = "all";
let searchQuery = "";
const DELIVERY_FEE = 250.00; // Batticaloa District default

// Format Currency
function formatLKR(amount) {
  return "LKR " + Number(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Render Products Grid
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const filtered = PRODUCTS.filter(p => {
    const matchesCat = selectedCategoryId === "all" || p.categoryId === selectedCategoryId;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="glass-card" style="grid-column: 1 / -1; padding: 48px; text-align: center;">
        <h4 style="font-family: var(--font-heading); font-size: 1.1rem;">No matching products found</h4>
        <p style="color: var(--color-secondary-text); font-size: 0.9rem; margin-top: 6px;">
          Try searching for "rice", "milk", "tea", or select "All Products"
        </p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const cartItem = cart.find(c => c.productId === product.id);
    const qty = cartItem ? cartItem.quantity : 0;

    return `
      <article class="product-glass-card" data-id="${product.id}">
        <div class="product-img-wrap">
          <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
          ${product.discountPercent > 0 ? `<span class="product-discount-badge">${product.discountPercent}% OFF</span>` : ''}
          <span class="product-stock-tag">In Stock (${product.stockCount})</span>
        </div>

        <div class="product-card-body">
          <span class="product-cat-tag">${product.categoryName}</span>
          <h4 class="product-name">${product.name}</h4>
          <span class="product-unit">${product.unit}</span>

          <div class="product-price-row">
            <div>
              <span class="product-price">${formatLKR(product.price)}</span>
              ${product.discountPercent > 0 ? `<span class="product-original-price">${formatLKR(product.originalPrice)}</span>` : ''}
            </div>

            ${qty === 0 ? `
              <button type="button" class="btn-add-cart" onclick="addToCart('${product.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span>Add</span>
              </button>
            ` : `
              <div class="qty-control-row">
                <button type="button" class="btn-qty" onclick="updateQty('${product.id}', -1)" aria-label="Decrease quantity">−</button>
                <span class="qty-display">${qty}</span>
                <button type="button" class="btn-qty" onclick="updateQty('${product.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
            `}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Cart Management
function addToCart(productId) {
  const existing = cart.find(c => c.productId === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  const prod = PRODUCTS.find(p => p.id === productId);
  showToast(`Added ${prod?.name || 'Item'} to cart`);
  updateCartUI();
  renderProducts();
}

function updateQty(productId, delta) {
  const itemIndex = cart.findIndex(c => c.productId === productId);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
      showToast('Item removed from cart', 'info');
    }
  }
  updateCartUI();
  renderProducts();
}

function updateCartUI() {
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update badges
  const headerBadge = document.getElementById("headerCartCount");
  const drawerBadge = document.getElementById("cartBadgeCount");
  if (headerBadge) headerBadge.textContent = totalItemCount;
  if (drawerBadge) drawerBadge.textContent = `${totalItemCount} items`;

  // Render Drawer Items
  const itemsContainer = document.getElementById("cartItemsList");
  let subtotal = 0;

  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--color-secondary-text);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5" style="margin-bottom: 12px;">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <p style="font-weight: 600;">Your demo cart is empty</p>
          <small>Select items from the catalog above</small>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        if (!product) return '';
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        return `
          <div class="drawer-item">
            <img src="${product.image}" alt="${product.name}" class="drawer-item-img">
            <div class="drawer-item-details">
              <div class="drawer-item-name">${product.name}</div>
              <div class="drawer-item-price">${formatLKR(itemTotal)} <small style="color:var(--color-secondary-text); font-weight:normal;">(${formatLKR(product.price)} ea)</small></div>
            </div>
            <div class="qty-control-row">
              <button type="button" class="btn-qty" onclick="updateQty('${product.id}', -1)">−</button>
              <span class="qty-display">${item.quantity}</span>
              <button type="button" class="btn-qty" onclick="updateQty('${product.id}', 1)">+</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Calculate totals
  const subtotalEl = document.getElementById("cartSubtotal");
  const feeEl = document.getElementById("cartDeliveryFee");
  const grandTotalEl = document.getElementById("cartGrandTotal");

  const effectiveDelivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + effectiveDelivery;

  if (subtotalEl) subtotalEl.textContent = formatLKR(subtotal);
  if (feeEl) feeEl.textContent = formatLKR(effectiveDelivery);
  if (grandTotalEl) grandTotalEl.textContent = formatLKR(grandTotal);
}

// Category Selection
function selectCategory(el, catId) {
  document.querySelectorAll("#categoryChips .glass-chip").forEach(btn => btn.classList.remove("active"));
  el.classList.add("active");
  selectedCategoryId = catId;
  renderProducts();
}

// Search
function handleSearch(val) {
  searchQuery = val;
  renderProducts();
}

function clearSearch() {
  const searchInput = document.getElementById("demoSearch");
  if (searchInput) {
    searchInput.value = "";
    searchQuery = "";
    renderProducts();
  }
}

// Glassmorphism Blur Inspector
function adjustGlassBlur(val) {
  document.documentElement.style.setProperty('--glass-blur-radius', `${val}px`);
  const label = document.getElementById("blurValLabel");
  if (label) label.textContent = `Blur: ${val}px`;
}

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2400);
}

// Dialog & Drawer Controls (Following Modern Web Guidance)
document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("interactiveDialog");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeDialogBtn = document.getElementById("closeDialogBtn");
  const cancelDialogBtn = document.getElementById("cancelDialogBtn");
  const saveDialogBtn = document.getElementById("saveDialogBtn");

  const cartDrawer = document.getElementById("cartDrawer");
  const cartTriggerBtn = document.getElementById("cartTriggerBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");

  // Open native dialog modal
  if (openModalBtn && dialog) {
    openModalBtn.addEventListener("click", () => {
      dialog.showModal();
    });
  }

  // Close dialog buttons
  [closeDialogBtn, cancelDialogBtn].forEach(btn => {
    if (btn && dialog) {
      btn.addEventListener("click", () => dialog.close());
    }
  });

  if (saveDialogBtn && dialog) {
    saveDialogBtn.addEventListener("click", () => {
      const storeSelect = document.getElementById("activeStoreSelect");
      const storeName = storeSelect ? storeSelect.options[storeSelect.selectedIndex].text : "Default";
      showToast(`Prototype store set to: ${storeName}`);
      dialog.close();
    });
  }

  // Light dismiss fallback for dialog: close when clicking on backdrop
  if (dialog) {
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  }

  // Cart Drawer Toggle
  if (cartTriggerBtn && cartDrawer) {
    cartTriggerBtn.addEventListener("click", () => {
      cartDrawer.classList.toggle("open");
      cartDrawer.setAttribute("aria-hidden", !cartDrawer.classList.contains("open"));
    });
  }

  if (closeCartBtn && cartDrawer) {
    closeCartBtn.addEventListener("click", () => {
      cartDrawer.classList.remove("open");
      cartDrawer.setAttribute("aria-hidden", "true");
    });
  }

  // Initial render
  renderProducts();
  updateCartUI();
});

