"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  BarChart3,
  Bike,
  Boxes,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  PackageCheck,
  Store,
  X,
} from "lucide-react";
import { useAdminData } from "@/context/AdminContext";

const superAdminNavigation = [
  { href: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/inventory", label: "Main inventory", icon: Boxes },
  { href: "/admin/transfers", label: "Stock transfers", icon: ClipboardList },
  { href: "/admin/stores", label: "Store network", icon: Store },
  { href: "/admin/riders", label: "Rider KYC", icon: Bike },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

const storeAdminNavigation = [
  { href: "/admin/orders", label: "Orders & alerts", icon: ClipboardList },
  { href: "/admin/store-stock", label: "Store stock", icon: Boxes },
  { href: "/admin/transfers", label: "Incoming transfers", icon: PackageCheck },
  { href: "/admin/deposits", label: "Deposit verification", icon: BadgeDollarSign },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { sessionUser, sessionLoading } = useAdminData();
  const isStoreAdmin = sessionUser?.role === "STORE_ADMIN";
  const navigation = sessionLoading ? [] : isStoreAdmin ? storeAdminNavigation : superAdminNavigation;
  const home = isStoreAdmin ? "/admin/orders" : "/admin/overview";
  const roleLabel = sessionLoading ? "Admin" : isStoreAdmin ? "Store Admin" : "Super Admin";

  return (
    <div className="flex h-full flex-col bg-white/95 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
        <Link href={home} onClick={onNavigate} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-buyme-primary to-buyme-primary-deep text-xl font-extrabold text-white shadow-glass">
            B
          </span>
          <span>
            <span className="block font-heading text-lg font-extrabold leading-tight text-buyme-navy">
              Buy<span className="text-buyme-primary">Me</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-buyme-secondary">
              {roleLabel}
            </span>
          </span>
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Close navigation"
          >
            <X size={19} aria-hidden="true" />
          </button>
        )}
      </div>

      <nav aria-label={`${roleLabel} navigation`} className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {sessionLoading ? "Loading" : isStoreAdmin ? "Store operations" : "Operations"}
        </p>
        {sessionLoading && <p className="px-3 py-2 text-xs text-slate-500" role="status">Verifying account…</p>}
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin/overview" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-semibold transition-colors ${
                active
                  ? "bg-buyme-primary text-white shadow-[0_8px_20px_rgba(228,0,43,0.18)]"
                  : "text-slate-600 hover:bg-rose-50 hover:text-buyme-primary"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} aria-hidden="true" />
                {label}
              </span>
              {active && <ChevronRight size={15} aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        {sessionLoading ? (
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" aria-label="Loading account details" />
        ) : isStoreAdmin ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3">
            <p className="text-xs font-bold text-amber-950">{sessionUser.store?.code ?? "Assigned store"}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-900/80">{sessionUser.store?.name ?? "Loading store…"}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3">
            <p className="text-xs font-bold text-amber-950">Batticaloa district</p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-900/80">
              Store locations are approximate area-level positions.
            </p>
          </div>
        )}
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/80 shadow-[4px_0_24px_rgba(31,36,48,0.04)] md:flex md:flex-col">
        <SidebarContent />
      </aside>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl">
            <SidebarContent onNavigate={() => setIsSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
