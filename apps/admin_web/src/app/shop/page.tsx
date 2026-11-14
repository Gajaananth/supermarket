"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { categoriesData, productsData, storesData } from "@/lib/mockData";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle,
  Truck,
  ArrowRight,
  MapPin,
  Banknote,
  Sparkles,
} from "lucide-react";

interface CartItem {
  product: any;
  quantity: number;
}

const DELIVERY_ZONES = [
  { id: "z1", name: "Zone 1: Puliyanthivu / Town (< 2 km)", fee: 200, locality: "Puliyanthivu" },
  { id: "z2", name: "Zone 2: Kattankudy / Kallady (2 - 5 km)", fee: 250, locality: "Kattankudy" },
  { id: "z3", name: "Zone 3: Eravur / Chenkalady (5 - 8 km)", fee: 350, locality: "Eravur" },
  { id: "z4", name: "Zone 4: Valaichenai / Oddamavadi (8 - 12 km)", fee: 450, locality: "Valaichenai" },
  { id: "z5", name: "Zone 5: Vellavely / Outskirts (12+ km)", fee: 550, locality: "Vellavely" },
];

const FREE_DELIVERY_THRESHOLD = 5000;

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStore, setSelectedStore] = useState<string>(storesData[0]?.id || "BM-S01");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("z1");
  const [streetAddress, setStreetAddress] = useState<string>("No. 18 Central Road, Puliyanthivu");
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("buyme_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {}
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("buyme_cart", JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const handleResetData = () => {
    localStorage.removeItem("buyme_session");
    localStorage.removeItem("buyme_cart");
    localStorage.removeItem("buyme_orders");
    window.location.reload();
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  const selectedZone = DELIVERY_ZONES.find((z) => z.id === selectedZoneId) || DELIVERY_ZONES[0];
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = isFreeDelivery ? 0 : selectedZone.fee;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const currentStoreObj: any = storesData.find((s) => s.id === selectedStore) || storesData[0];
    const newOrderRef = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: newOrderRef,
      orderNumber: newOrderRef,
      customerId: "cust-01",
      customerName: "Ananya S.",
      customerPhone: "+94 77 123 4567",
      deliveryAddress: `${streetAddress}, ${selectedZone.locality}, Batticaloa`,
      storeId: selectedStore,
      storeName: currentStoreObj.name || currentStoreObj.storeName || "BuyMe Batticaloa Town",
      items: cart.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        productName: i.product.name,
        unit: i.product.unit || "pack",
        price: i.product.price,
        unitPrice: i.product.price,
        quantity: i.quantity,
        qty: i.quantity,
        subtotal: i.product.price * i.quantity,
        totalPrice: i.product.price * i.quantity,
      })),
      itemsTotal: subtotal,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      totalAmount: grandTotal,
      total: grandTotal,
      discount: isFreeDelivery ? selectedZone.fee : 0,
      orderStatus: "placed",
      status: "placed",
      paymentMethod: "COD",
      paymentStatus: "pending",
      riderId: null,
      riderName: null,
      createdAt: new Date().toISOString(),
      estimatedDelivery: "25-35 mins",
      notes: "Cash on delivery order placed via BuyMe storefront.",
    };

    // Save to localStorage shared state
    try {
      const existingStr = localStorage.getItem("buyme_orders");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const updated = [newOrder, ...existing];
      localStorage.setItem("buyme_orders", JSON.stringify(updated));
      window.dispatchEvent(new Event("buyme_orders_updated"));
    } catch (e) {}

    // Reset cart and open success modal
    setCart([]);
    setIsCartOpen(false);
    setPlacedOrder(newOrder);
  };

  const filteredProducts =
    selectedCategory === "all"
      ? productsData
      : productsData.filter(
          (p: any) => p.category === selectedCategory || p.categoryId === selectedCategory
        );

  return (
    <div className="min-h-screen aurora-bg flex flex-col">
      {/* Demo Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs flex items-center justify-between text-amber-900 sticky top-0 z-50 backdrop-blur-md">
        <span className="font-medium text-[11px] sm:text-xs">
          ⚠️ <strong>DEMO</strong> — Simulated Batticaloa grocery data (Cash on Delivery only). Not live.
        </span>
        <button
          onClick={handleResetData}
          className="text-[11px] font-bold text-amber-900 underline hover:text-[#E4002B] ml-2 shrink-0"
        >
          Reset demo data
        </button>
      </div>

      {/* Header */}
      <header className="sticky top-[31px] z-40 glass-surface border-b border-white/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="text-2xl font-extrabold text-[#1F2430] tracking-tight">
            Buy<span className="text-[#E4002B]">Me</span>
          </Link>
          <div className="flex items-center gap-2 bg-white/90 border border-gray-200/90 px-3 py-1.5 rounded-2xl text-xs shadow-sm max-w-[200px] sm:max-w-none">
            <MapPin className="w-3.5 h-3.5 text-[#E4002B] shrink-0" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent font-semibold text-[#1F2430] focus:outline-none cursor-pointer truncate"
            >
              {storesData.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.storeName} ({s.location || s.locality})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/shop/account"
            className="text-xs font-semibold text-gray-700 hover:text-[#E4002B] hidden sm:block"
          >
            My Account
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E4002B] hover:bg-[#B80022] text-white rounded-2xl font-bold text-xs shadow-md shadow-red-500/25 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({totalItems})</span>
            {subtotal > 0 && <span className="hidden sm:inline">• LKR {subtotal.toLocaleString()}</span>}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#E4002B] via-[#B80022] to-[#FFC20E] text-white p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
              Fast Delivery Across Batticaloa
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Fresh Produce & Daily Essentials
            </h1>
            <p className="mt-2 text-white/90 text-xs sm:text-sm">
              Delivered in 25-35 minutes from 10 store hubs. <strong>Free delivery</strong> on orders over LKR 5,000! Cash on Delivery only.
            </p>
          </div>
        </div>

        {/* Categories Rail */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1F2430] mb-3">Shop by Category</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-[#E4002B] text-white shadow-md shadow-red-500/20"
                  : "bg-white/80 text-gray-700 border border-gray-200/80 hover:bg-white"
              }`}
            >
              All Items ({productsData.length})
            </button>
            {categoriesData.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-[#E4002B] text-white shadow-md shadow-red-500/20"
                    : "bg-white/80 text-gray-700 border border-gray-200/80 hover:bg-white"
                }`}
              >
                {cat.name} {cat.tamilName && `(${cat.tamilName})`}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-[#1F2430]">
              Available Products ({filteredProducts.length})
            </h2>
            <span className="text-xs text-gray-500">Local store stock • Cash on Delivery</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p: any) => {
              const inCartItem = cart.find((i) => i.product.id === p.id);
              return (
                <div
                  key={p.id}
                  className="glass-surface rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition-all border border-white/80"
                >
                  <div className="space-y-2">
                    <div className="h-32 rounded-xl bg-gradient-to-br from-red-50 to-amber-50/40 flex items-center justify-center text-gray-400 font-medium text-xs overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-contain p-2" />
                      ) : (
                        <span>{p.name}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#1F2430] line-clamp-1">{p.name}</h3>
                      {p.tamilName && (
                        <p className="text-[11px] text-gray-500 line-clamp-1">{p.tamilName}</p>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-base font-extrabold text-[#E4002B]">
                        LKR {p.price?.toLocaleString()}
                      </span>
                      {p.unit && <span className="text-[10px] text-gray-500">/ {p.unit}</span>}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100/80">
                    {inCartItem ? (
                      <div className="flex items-center justify-between bg-red-50/80 rounded-xl p-1 border border-red-100">
                        <button
                          onClick={() => updateQuantity(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white text-[#E4002B] flex items-center justify-center font-bold shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-[#1F2430]">{inCartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#E4002B] text-white flex items-center justify-center font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-2 bg-white hover:bg-red-50 text-[#E4002B] border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Slide-out Cart & Checkout Drawer */}
      <div className={`fixed inset-0 z-50 flex justify-end ${isCartOpen ? "block" : "hidden"}`}>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/90">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E4002B]" />
                <h2 className="font-extrabold text-base text-[#1F2430]">
                  Your Basket ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-50 text-[#E4002B] flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-sm text-[#1F2430]">Your basket is empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Browse fresh lagoon catch, local produce, and dairy essentials from 10 store hubs.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-200 shrink-0 flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400">IMG</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#1F2430] truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-[11px] text-[#E4002B] font-bold">
                          LKR {item.product.price?.toLocaleString()} × {item.quantity} = LKR{" "}
                          {(item.product.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded-md bg-[#E4002B] text-white flex items-center justify-center text-xs font-bold hover:bg-[#B80022]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-gray-400 hover:text-red-500 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              {/* Delivery Zone & Address Selection */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 font-heading">
                  Delivery Details (Batticaloa)
                </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Delivery Zone</label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#1F2430] focus:outline-none focus:border-[#E4002B]"
                    >
                      {DELIVERY_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — LKR {zone.fee}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Street Address / Landmark</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. No. 18 Central Road, Puliyanthivu"
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-[#1F2430] focus:outline-none focus:border-[#E4002B]"
                    />
                  </div>

                  {/* Free Delivery Meter */}
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    {isFreeDelivery ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>🎉 Free Delivery Unlocked! (Order &gt; LKR 5,000)</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-xs font-semibold text-amber-900">
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#E4002B]" />
                            Free Delivery at LKR 5,000
                          </span>
                          <span className="font-bold text-[#E4002B]">
                            +LKR {(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()} away
                          </span>
                        </div>
                        <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#E4002B] h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Payment Method COD */}
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5">
                    <Banknote className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-900">Cash on Delivery (COD) Only</h4>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        Pay exact cash to the BuyMe courier at your doorstep upon receiving your grocery package.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>

            {/* Drawer Footer & Checkout Action */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-white space-y-3 shadow-lg">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#1F2430]">LKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee ({selectedZone.locality})</span>
                    <span className={isFreeDelivery ? "font-bold text-emerald-600" : "font-semibold text-[#1F2430]"}>
                      {isFreeDelivery ? "FREE" : `LKR ${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-[#1F2430] pt-1.5 border-t border-gray-100">
                    <span>Grand Total (COD)</span>
                    <span className="text-[#E4002B]">LKR {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-[#E4002B] hover:bg-[#B80022] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Place Order — LKR {grandTotal.toLocaleString()} (COD)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Order Placed Success Confirmation Modal */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Order Placed • Cash on Delivery
              </span>
              <h2 className="text-xl font-extrabold text-[#1F2430] mt-2 font-heading">
                Order Confirmed!
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Your order is registered with the <strong>{placedOrder.storeName}</strong> fulfillment station.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Reference</span>
                <span className="font-mono font-bold text-[#1F2430]">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Due (COD)</span>
                <span className="font-bold text-[#E4002B]">LKR {placedOrder.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address</span>
                <span className="font-medium text-[#1F2430] text-right truncate max-w-[200px]">
                  {placedOrder.deliveryAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Delivery</span>
                <span className="font-bold text-emerald-600">{placedOrder.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Initial Status</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] uppercase">
                  {placedOrder.orderStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/admin/orders"
                onClick={() => setPlacedOrder(null)}
                className="w-full py-3 bg-[#E4002B] hover:bg-[#B80022] text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Track in Admin Orders Stream →</span>
              </Link>
              <button
                onClick={() => setPlacedOrder(null)}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-xs hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
