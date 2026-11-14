import React from "react";
import Link from "next/link";

export default function RootHomePage() {
  const portals = [
    {
      title: "Customer Storefront",
      path: "/shop",
      description: "Browse 10 Batticaloa stores, fresh categories, local groceries, and order with Cash on Delivery (COD).",
      badge: "Customer",
      badgeColor: "bg-red-100 text-[#E4002B]",
      accentBorder: "hover:border-[#E4002B]/60",
      cta: "Launch Storefront →",
    },
    {
      title: "Rider Operations Portal",
      path: "/rider",
      description: "Live shift dashboard, doorstep COD collections, active orders, and strict LKR 10,000 cash threshold meter.",
      badge: "Rider",
      badgeColor: "bg-amber-100 text-amber-800",
      accentBorder: "hover:border-amber-400",
      cta: "Launch Rider Portal →",
    },
    {
      title: "Executive Admin Dashboard",
      path: "/admin",
      description: "Multi-store fulfillment center: real-time orders, store-scoped inventory, fleet dispatch, and financial KPIs.",
      badge: "Admin",
      badgeColor: "bg-red-100 text-[#E4002B]",
      accentBorder: "hover:border-red-400",
      cta: "Open Admin Dashboard →",
    },
    {
      title: "Design System Preview",
      path: "/design-preview",
      description: "Living design system showcase: Red/White/Yellow tokens, real glassmorphism blur cards, badges, and meters.",
      badge: "Design Tokens",
      badgeColor: "bg-purple-100 text-purple-800",
      accentBorder: "hover:border-purple-400",
      cta: "Inspect Design System →",
    },
    {
      title: "Multi-Role Authentication",
      path: "/login",
      description: "Centralized login shell with instant role switching: Customer, Rider, Store Admin, and HQ Admin.",
      badge: "Auth",
      badgeColor: "bg-emerald-100 text-emerald-800",
      accentBorder: "hover:border-emerald-400",
      cta: "Go to Login →",
    },
  ];

  return (
    <div className="min-h-screen aurora-bg flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-[#E4002B] animate-pulse"></span>
            <span className="text-xs font-bold text-[#E4002B] tracking-wider uppercase">
              Batticaloa District • Sri Lanka
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1F2430] tracking-tight">
            Buy<span className="text-[#E4002B]">Me</span> Platform
          </h1>
          <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto">
            Multi-store grocery delivery ecosystem powered by real glassmorphism, hyper-local fulfillment, and synchronized operations.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => (
            <Link
              key={portal.path}
              href={portal.path}
              className={`glass-surface rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-white/80 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${portal.accentBorder}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                  <span className="text-xs font-mono text-gray-400">{portal.path}</span>
                </div>
                <h2 className="text-xl font-bold text-[#1F2430]">{portal.title}</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">{portal.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center font-bold text-sm text-[#E4002B]">
                {portal.cta}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-[#9CA3AF]">
        BuyMe Supermarket Platform • 10 Hubs in Batticaloa District • Design System & Next.js App Router
      </footer>
    </div>
  );
}
