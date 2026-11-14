"use client";

import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Search,
  SlidersHorizontal,
  Plus,
  Minus,
  CheckCircle,
  Clock,
  Package,
  Bike,
  CheckCheck,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Banknote,
  Truck,
  Layers,
  LayoutGrid,
  Apple,
  Carrot,
  Milk,
  Fish,
  RefreshCw,
  Bell,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function DesignPreviewPage() {
  const [activeTab, setActiveTab] = useState<"all" | "tokens" | "cards" | "status" | "timeline">("all");
  const [qty1, setQty1] = useState(1);
  const [qty2, setQty2] = useState(0);
  const [selectedCat, setSelectedCat] = useState("fruits");
  const [toastMessage, setToastMessage] = useState<string | null>("BuyMe Batticaloa Design System Active");

  return (
    <div className="relative min-h-screen bg-[#F7FAFF] text-[#1E293B] font-body selection:bg-[#E4002B]/20 selection:text-[#10243B] overflow-x-hidden p-4 md:p-8">
      {/* Aurora Ambient Blobs */}
      <div
        className="fixed top-[-100px] left-[-80px] w-[380px] h-[380px] rounded-full pointer-events-none blur-[90px] opacity-40 z-0"
        style={{ background: "radial-gradient(circle, #E4002B 0%, transparent 70%)" }}
      />
      <div
        className="fixed top-[20%] right-[-100px] w-[450px] h-[450px] rounded-full pointer-events-none blur-[110px] opacity-35 z-0"
        style={{ background: "radial-gradient(circle, #38BDF8 0%, transparent 70%)" }}
      />
      <div
        className="fixed bottom-[-60px] left-[30%] w-[500px] h-[500px] rounded-full pointer-events-none blur-[120px] opacity-30 z-0"
        style={{ background: "radial-gradient(circle, #B80022 0%, transparent 70%)" }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce shadow-floating-nav bg-white/95 backdrop-blur-glass border border-[#E4002B]/40 px-5 py-3 rounded-2xl flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-[#E4002B]/10 flex items-center justify-center text-[#E4002B]">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#10243B]">{toastMessage}</div>
            <div className="text-xs text-[#64748B]">BackdropFilter sigma 20 & 75% white border</div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-[#94A3B8] hover:text-[#10243B] ml-2"
          >
            ?
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <header className="bg-white/70 backdrop-blur-glass border border-white/80 shadow-glass rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {/* Custom BuyMe Vector Icon */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#B80022] shadow-neon-glow flex items-center justify-center text-white font-heading font-black text-2xl tracking-tighter">
              D
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-black text-2xl tracking-tight text-[#E4002B]">D</span>
                <span className="font-heading font-black text-2xl tracking-tight text-[#10243B]">Mart</span>
                <span className="bg-[#E4002B]/10 text-[#E4002B] text-[10px] font-heading font-extrabold uppercase px-2 py-0.5 rounded-full border border-[#E4002B]/25">
                  Design System v2.0
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Unified Design Tokens & Component Library � Batticaloa District Hubs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 bg-[#FEF2F2] px-3 py-1.5 rounded-full border border-[#E4002B]/20 text-xs font-semibold text-[#10243B]">
              <MapPin className="w-3.5 h-3.5 text-[#E4002B]" />
              <span>10 Batticaloa Stores</span>
            </div>
            <button
              onClick={() => setToastMessage("Tokens synchronized across Flutter & Next.js!")}
              className="bg-[#E4002B] hover:bg-[#B80022] active:scale-95 transition-all text-white px-4 py-2 rounded-xl text-xs font-bold shadow-neon-glow flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Glow Action</span>
            </button>
          </div>
        </header>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
          {[
            { id: "all", label: "All Components", icon: LayoutGrid },
            { id: "tokens", label: "Colors & Typography", icon: Layers },
            { id: "cards", label: "Product & Category Cards", icon: ShoppingBag },
            { id: "status", label: "Badges & Stats", icon: TrendingUp },
            { id: "timeline", label: "Tracking & Timeline", icon: Truck },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#E4002B] text-white shadow-neon-glow"
                    : "bg-white/60 text-[#475569] hover:bg-white hover:text-[#10243B]"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SECTION 1: Colors & Typography */}
        {(activeTab === "all" || activeTab === "tokens") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-[#E4002B] rounded-full" />
              <h2 className="font-heading font-extrabold text-lg text-[#10243B]">
                01. Master Brand Tokens & High Contrast Typography
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Swatches Card */}
              <div className="bg-white/70 backdrop-blur-glass border border-white/80 shadow-glass rounded-2xl p-5 space-y-4">
                <h3 className="font-heading font-bold text-sm text-[#10243B]">Neon Ice Glass Palette</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "BuyMe Crimson Red", hex: "#E4002B", bg: "bg-[#E4002B]", text: "text-white" },
                    { name: "Deep Blue", hex: "#B80022", bg: "bg-[#B80022]", text: "text-white" },
                    { name: "Dark Navy", hex: "#10243B", bg: "bg-[#10243B]", text: "text-white" },
                    { name: "Ice White", hex: "#F7FAFF", bg: "bg-[#F7FAFF] border border-slate-200", text: "text-[#10243B]" },
                    { name: "Soft Blue", hex: "#FEF2F2", bg: "bg-[#FEF2F2] border border-red-100", text: "text-[#10243B]" },
                    { name: "Success", hex: "#10B981", bg: "bg-[#10B981]", text: "text-white" },
                    { name: "Warning", hex: "#F59E0B", bg: "bg-[#F59E0B]", text: "text-white" },
                    { name: "Error", hex: "#EF4444", bg: "bg-[#EF4444]", text: "text-white" },
                  ].map((c) => (
                    <div key={c.name} className={`${c.bg} p-2.5 rounded-xl flex flex-col justify-between h-18 shadow-sm`}>
                      <span className={`text-[10px] font-bold ${c.text}`}>{c.name}</span>
                      <span className={`text-[9px] font-mono opacity-80 ${c.text}`}>{c.hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Spec */}
              <div className="bg-white/70 backdrop-blur-glass border border-white/80 shadow-glass rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-sm text-[#10243B]">Bilingual Typography Hierarchy</h3>
                <div className="space-y-2">
                  <div className="font-heading font-extrabold text-xl text-[#10243B]">
                    Heading H1 � Manrope 800 (Bold)
                  </div>
                  <div className="font-heading font-bold text-base text-[#10243B]">
                    Heading H2 � Manrope 700 (Subheading)
                  </div>
                  <div className="text-xs text-[#1E293B] font-medium leading-relaxed">
                    Body Regular � DM Sans 500: High-contrast body text ensuring WCAG AA compliance across light glass surfaces.
                  </div>
                  <div className="text-xs font-semibold text-[#10243B] bg-[#FEF2F2] p-2.5 rounded-xl border border-[#E4002B]/20">
                    <span className="text-[10px] uppercase font-bold text-[#E4002B] block">Tamil Script (Noto Sans Tamil)</span>
                    ???????????? ???????????? ????? ??????? ?????????? ??????? ????.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: Interactive Controls & Search */}
        {(activeTab === "all" || activeTab === "tokens") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-[#E4002B] rounded-full" />
              <h2 className="font-heading font-extrabold text-lg text-[#10243B]">
                02. Frosted Search, Inputs & Press-Scale Buttons
              </h2>
            </div>

            <div className="bg-white/70 backdrop-blur-glass border border-white/80 shadow-glass rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    Frosted Glass Search
                  </label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search fresh groceries, seafood, dairy in Batticaloa..."
                      className="w-full pl-10 pr-10 py-3 bg-white/80 backdrop-blur-glass border border-white/90 rounded-2xl text-xs font-medium text-[#10243B] placeholder-[#94A3B8] shadow-card focus:outline-none focus:ring-2 focus:ring-[#E4002B]/40 focus:border-[#E4002B]"
                    />
                    <button className="absolute right-3 p-1 rounded-lg hover:bg-[#FEF2F2] text-[#E4002B]">
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Text Field */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                    BuyMe High-Contrast Input
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-[#E4002B] absolute left-3.5" />
                    <input
                      type="text"
                      defaultValue="Kallady Beach Road, Batticaloa"
                      className="w-full pl-10 pr-10 py-3 bg-white border border-[#CBD5E1] rounded-2xl text-xs font-semibold text-[#10243B] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E4002B] focus:border-[#E4002B]"
                    />
                    <CheckCircle className="w-4 h-4 text-[#10B981] absolute right-3.5" />
                  </div>
                  <span className="text-[10px] text-[#64748B] mt-1 block">
                    Verified store coverage: BuyMe Batticaloa Central Hub.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Primary & Secondary Button States
                </label>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-[#E4002B] hover:bg-[#B80022] active:scale-95 transition-transform text-white font-heading font-bold text-xs px-5 py-3 rounded-2xl shadow-neon-glow flex items-center space-x-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Primary Action (Press Scale)</span>
                  </button>

                  <button className="bg-[#FEF2F2] hover:bg-[#D5E7FF] text-[#10243B] font-heading font-bold text-xs px-5 py-3 rounded-2xl border border-[#E4002B]/25 flex items-center space-x-2">
                    <span>Secondary Action</span>
                    <ArrowRight className="w-4 h-4 text-[#E4002B]" />
                  </button>
                </div>

                {/* Glass Surfaces Showcase */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/60 backdrop-blur-glass border border-white/75 p-3 rounded-xl shadow-card text-xs">
                    <div className="font-bold text-[#10243B]">Standard Glass</div>
                    <div className="text-[10px] text-[#64748B]">Fill 68%, Blur 20px</div>
                  </div>
                  <div className="bg-white/85 backdrop-blur-glass border border-white/90 p-3 rounded-xl shadow-glass-elevated text-xs">
                    <div className="font-bold text-[#10243B]">Elevated Glass</div>
                    <div className="text-[10px] text-[#64748B]">Fill 82%, Shadow 48px</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: Product Cards & Category Cards */}
        {(activeTab === "all" || activeTab === "cards") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-[#E4002B] rounded-full" />
              <h2 className="font-heading font-extrabold text-lg text-[#10243B]">
                03. Category Pills & Product Cards (LKR Currency)
              </h2>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "fruits", name: "Fresh Fruits", nameTa: "???????", icon: Apple, count: 48 },
                { id: "veggies", name: "Vegetables", nameTa: "??????????", icon: Carrot, count: 64 },
                { id: "dairy", name: "Dairy & Milk", nameTa: "???? ?????????", icon: Milk, count: 32 },
                { id: "seafood", name: "Lagoon Seafood", nameTa: "???? ????", icon: Fish, count: 22 },
              ].map((c) => {
                const IconC = c.icon;
                const isSelected = selectedCat === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCat(c.id)}
                    className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center space-y-2 ${
                      isSelected
                        ? "bg-[#FEF2F2] border-[#E4002B] shadow-neon-glow"
                        : "bg-white/70 backdrop-blur-glass border-white/80 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-[#E4002B] text-white" : "bg-[#FEF2F2] text-[#E4002B]"
                      }`}
                    >
                      <IconC className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-xs text-[#10243B]">{c.name}</div>
                      <div className="text-[10px] text-[#64748B] font-medium">{c.nameTa}</div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#CBD5E1] text-[#475569]">
                      {c.count} items
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Product 1 */}
              <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-4 shadow-glass space-y-3 flex flex-col justify-between">
                <div>
                  <div className="relative h-36 bg-gradient-to-br from-[#FEF2F2] to-white rounded-xl flex items-center justify-center p-2 border border-slate-100">
                    <span className="absolute top-2 left-2 bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      15% OFF
                    </span>
                    <div className="w-16 h-16 rounded-full bg-[#E4002B]/10 flex items-center justify-center text-[#E4002B]">
                      <Apple className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[10px] uppercase font-bold text-[#E4002B] tracking-wider">Produce � 1 kg</div>
                    <div className="font-heading font-bold text-sm text-[#10243B]">Fresh Red Tomatoes</div>
                    <div className="text-xs text-[#64748B]">???????? ???????</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="font-heading font-black text-base text-[#E4002B]">LKR 380.00</div>
                    <div className="text-[10px] text-[#94A3B8] line-through">LKR 450.00</div>
                  </div>

                  {qty1 === 0 ? (
                    <button
                      onClick={() => setQty1(1)}
                      className="bg-[#E4002B] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-neon-glow hover:bg-[#B80022] active:scale-95 transition-all"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-white rounded-xl border border-[#CBD5E1] px-2 py-1 shadow-sm">
                      <button
                        onClick={() => setQty1(Math.max(0, qty1 - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#10243B]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-heading font-bold text-xs text-[#10243B] w-4 text-center">
                        {qty1}
                      </span>
                      <button
                        onClick={() => setQty1(qty1 + 1)}
                        className="w-6 h-6 rounded-lg bg-[#E4002B] hover:bg-[#B80022] flex items-center justify-center text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product 2 */}
              <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-4 shadow-glass space-y-3 flex flex-col justify-between">
                <div>
                  <div className="relative h-36 bg-gradient-to-br from-[#FEF2F2] to-white rounded-xl flex items-center justify-center p-2 border border-slate-100">
                    <span className="absolute top-2 left-2 bg-[#10B981] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      FRESH IN
                    </span>
                    <div className="w-16 h-16 rounded-full bg-[#E4002B]/10 flex items-center justify-center text-[#E4002B]">
                      <Milk className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[10px] uppercase font-bold text-[#E4002B] tracking-wider">Dairy � 400 g</div>
                    <div className="font-heading font-bold text-sm text-[#10243B]">Anchor Full Cream Milk</div>
                    <div className="text-xs text-[#64748B]">???? ??</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="font-heading font-black text-base text-[#E4002B]">LKR 1,150.00</div>
                    <div className="text-[10px] text-[#64748B]">In Stock</div>
                  </div>

                  {qty2 === 0 ? (
                    <button
                      onClick={() => setQty2(1)}
                      className="bg-[#E4002B] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-neon-glow hover:bg-[#B80022] active:scale-95 transition-all"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-white rounded-xl border border-[#CBD5E1] px-2 py-1 shadow-sm">
                      <button
                        onClick={() => setQty2(Math.max(0, qty2 - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#10243B]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-heading font-bold text-xs text-[#10243B] w-4 text-center">
                        {qty2}
                      </span>
                      <button
                        onClick={() => setQty2(qty2 + 1)}
                        className="w-6 h-6 rounded-lg bg-[#E4002B] hover:bg-[#B80022] flex items-center justify-center text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Shimmer Skeleton Card */}
              <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-4 shadow-glass space-y-3">
                <div className="h-36 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-slate-200 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
                  <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 w-20 bg-slate-200 animate-pulse rounded" />
                  <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-xl" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Status Badges & KPI Stats */}
        {(activeTab === "all" || activeTab === "status") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-[#E4002B] rounded-full" />
              <h2 className="font-heading font-extrabold text-lg text-[#10243B]">
                04. Supermarket Status Badges & Dashboard KPI Cards
              </h2>
            </div>

            {/* Status Badges */}
            <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-4 shadow-glass">
              <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3">
                7 Official Lifecycle Status Badges
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFFBEB] text-[#F59E0B] border border-[#FDE68A]">
                  <Clock className="w-3 h-3" />
                  <span>Pending (??????????)</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#E4002B] border border-[#BFDBFE]">
                  <CheckCircle className="w-3 h-3" />
                  <span>Confirmed (?????????????????????)</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F5F3FF] text-[#8B5CF6] border border-[#DDD6FE]">
                  <Package className="w-3 h-3" />
                  <span>Preparing (??????????)</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Ready for Pickup</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#E4002B] border border-[#E4002B]/40 shadow-sm">
                  <Bike className="w-3 h-3" />
                  <span>Out for Delivery (?????????????)</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                  <CheckCheck className="w-3 h-3" />
                  <span>Delivered (?????????????)</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Cancelled (?????)</span>
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-5 shadow-glass space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#E4002B]/10 text-[#E4002B] flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                    +18.4%
                  </span>
                </div>
                <div className="font-heading font-extrabold text-2xl text-[#10243B]">LKR 148,500</div>
                <div className="text-xs text-[#64748B] font-medium">Daily Revenue (10 Hubs)</div>
              </div>

              <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-5 shadow-glass space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#B80022]/10 text-[#B80022] flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#E4002B] border border-[#BFDBFE]">
                    42 Active
                  </span>
                </div>
                <div className="font-heading font-extrabold text-2xl text-[#10243B]">384 Orders</div>
                <div className="text-xs text-[#64748B] font-medium">Today's Fulfillment</div>
              </div>

              <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-5 shadow-glass space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                    98.2%
                  </span>
                </div>
                <div className="font-heading font-extrabold text-2xl text-[#10243B]">24.8 mins</div>
                <div className="text-xs text-[#64748B] font-medium">Average Delivery Time</div>
              </div>

              <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-5 shadow-glass space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3FF] text-[#8B5CF6] border border-[#DDD6FE]">
                    100% Online
                  </span>
                </div>
                <div className="font-heading font-extrabold text-2xl text-[#10243B]">10 Stores</div>
                <div className="text-xs text-[#64748B] font-medium">Batticaloa District Only</div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: Stepper Timeline & Order Tracking */}
        {(activeTab === "all" || activeTab === "timeline") && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-[#E4002B] rounded-full" />
              <h2 className="font-heading font-extrabold text-lg text-[#10243B]">
                05. Order Tracking Stepper Timeline & Live States
              </h2>
            </div>

            <div className="bg-white/70 backdrop-blur-glass border border-white/80 rounded-2xl p-6 shadow-glass">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="text-xs text-[#64748B] font-bold uppercase tracking-wider">
                    Order #ORD-7742 (Express Delivery)
                  </div>
                  <div className="font-heading font-bold text-base text-[#10243B]">
                    Destination: 42 Kallady Beach Road, Batticaloa
                  </div>
                </div>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#E4002B] border border-[#E4002B]/40">
                  <Bike className="w-3.5 h-3.5" />
                  <span>Out for Delivery � Rider Suresh</span>
                </span>
              </div>

              {/* Stepper Steps */}
              <div className="mt-6 space-y-6">
                {[
                  {
                    title: "Order Placed & Confirmed",
                    titleTa: "?????? ?????????????????????",
                    desc: "BuyMe Batticaloa Central Hub � 6 fresh items",
                    time: "10:15 AM",
                    status: "done",
                  },
                  {
                    title: "Packed & Quality Inspected",
                    titleTa: "???? ?????????????",
                    desc: "Tamper-proof ice packed seal applied",
                    time: "10:28 AM",
                    status: "done",
                  },
                  {
                    title: "Rider Out For Delivery",
                    titleTa: "????????????? ??????",
                    desc: "Rider Suresh assigned (Hero Honda WP-8821)",
                    time: "10:35 AM",
                    status: "active",
                  },
                  {
                    title: "Delivered to Customer",
                    titleTa: "????????????",
                    desc: "Estimated arrival at Kallady in 12 mins",
                    time: "10:47 AM (Est)",
                    status: "pending",
                  },
                ].map((step, idx, arr) => (
                  <div key={step.title} className="flex items-start space-x-4">
                    {/* Circle & line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.status === "done"
                            ? "bg-[#E4002B] text-white shadow-sm"
                            : step.status === "active"
                            ? "bg-white border-2 border-[#E4002B] text-[#E4002B] shadow-neon-glow"
                            : "bg-slate-100 border border-slate-300 text-slate-400"
                        }`}
                      >
                        {step.status === "done" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : step.status === "active" ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#E4002B] animate-ping" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {idx !== arr.length - 1 && (
                        <div
                          className={`w-0.5 h-10 my-1 ${
                            step.status === "done" ? "bg-[#E4002B]" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>

                    {/* Step details */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <div className="font-heading font-bold text-sm text-[#10243B]">{step.title}</div>
                        <span className="text-xs font-semibold text-[#64748B]">{step.time}</span>
                      </div>
                      <div className="text-xs text-[#E4002B] font-medium">{step.titleTa}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

