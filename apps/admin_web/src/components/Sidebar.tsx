"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Store,
  Package,
  Layers,
  Boxes,
  Bike,
  Users,
  MapPin,
  BarChart3,
  Bell,
  Settings,
  X,
} from "lucide-react";
import { useAdminData } from "@/context/AdminContext";

interface MenuItem {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

const menuItems: MenuItem[] = [
  { id: "overview", href: "/admin/overview", label: "Executive Overview", icon: LayoutDashboard },
  { id: "orders", href: "/admin/orders", label: "Orders Stream", icon: ShoppingCart, badge: "22 Live", badgeColor: "bg-[#E4002B] text-white" },
  { id: "stores", href: "/admin/stores", label: "Stores Network", icon: Store, badge: "10 Hubs", badgeColor: "bg-emerald-100 text-emerald-800" },
  { id: "products", href: "/admin/products", label: "Product Catalog", icon: Package, badge: "42 Items", badgeColor: "bg-amber-100 text-amber-800" },
  { id: "categories", href: "/admin/categories", label: "Categories", icon: Layers },
  { id: "inventory", href: "/admin/inventory", label: "Store Inventory", icon: Boxes },
  { id: "riders", href: "/admin/riders", label: "Delivery Fleet", icon: Bike, badge: "15 Active", badgeColor: "bg-red-50 text-[#E4002B]" },
  { id: "customers", href: "/admin/customers", label: "Customers", icon: Users },
  { id: "deliveries", href: "/admin/deliveries", label: "Live Delivery Map", icon: MapPin },
  { id: "reports", href: "/admin/reports", label: "Analytics & Reports", icon: BarChart3 },
  { id: "notifications", href: "/admin/notifications", label: "Notifications & Alerts", icon: Bell },
  { id: "settings", href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Link href="/admin/overview" onClick={onClose} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#B80022] flex items-center justify-center text-white shadow-md shadow-red-500/30 font-heading font-black text-xl">
            B
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl text-[#1F2430] leading-none tracking-tight">
              Buy<span className="text-[#E4002B]">Me</span>
            </h1>
            <span className="text-[10px] font-bold text-[#E4002B] tracking-wider uppercase">
              Admin Ops Center
            </span>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
        <div className="text-[11px] font-bold text-[#6B7280] px-3 py-1.5 uppercase tracking-wider font-heading">
          Management
        </div>
        {menuItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#E4002B] text-white shadow-md shadow-red-500/25 font-semibold"
                  : "text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#6B7280]"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="text-[11px] font-bold text-[#6B7280] px-3 pt-4 pb-1.5 uppercase tracking-wider font-heading">
          Operations & Intelligence
        </div>
        {menuItems.slice(6).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#E4002B] text-white shadow-md shadow-red-500/25 font-semibold"
                  : "text-[#6B7280] hover:text-[#1F2430] hover:bg-red-50/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#6B7280]"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info / Currency Notice */}
      <div className="p-4 border-t border-gray-100 bg-white/50">
        <div className="bg-red-50/80 rounded-2xl p-3 border border-red-100">
          <div className="flex items-center justify-between text-xs text-[#B80022] font-bold">
            <span>Currency: LKR</span>
            <span className="text-[10px] bg-red-200/60 px-1.5 py-0.5 rounded font-mono">DEMO</span>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1 leading-snug">
            Batticaloa District • 10 Hyperlocal Store Pools
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useAdminData();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, setIsSidebarOpen]);

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-gray-200/80 h-screen sticky top-0 flex-col z-30 shadow-[4px_0_24px_rgba(31,36,48,0.04)]">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Slide-out Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            <SidebarContent onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
