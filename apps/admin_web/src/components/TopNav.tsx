"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, ShieldCheck, UserRound } from "lucide-react";
import { useAdminData } from "@/context/AdminContext";

export default function TopNav() {
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen, sessionUser, sessionLoading, sessionError } = useAdminData();
  const isStoreAdmin = sessionUser?.role === "STORE_ADMIN";

  const signOut = async () => {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      router.replace("/login?error=logout");
      return;
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-white/80 bg-white/80 px-4 shadow-[0_4px_20px_rgba(31,36,48,0.03)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-xl p-2 text-slate-600 hover:bg-rose-50 hover:text-buyme-primary md:hidden"
          aria-label="Open navigation"
          aria-expanded={isSidebarOpen}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="hidden h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary sm:flex">
          <ShieldCheck size={18} aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading text-sm font-extrabold text-buyme-navy">{isStoreAdmin ? "Store operations" : "Operations console"}</p>
          <p className="hidden text-[11px] text-slate-500 sm:block">
            {sessionLoading
              ? "Verifying session…"
              : isStoreAdmin
                ? `${sessionUser.store?.code ?? "Assigned store"} · Store Admin`
                : "Batticaloa · Super Admin"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {sessionError && <span className="hidden text-xs font-semibold text-red-800 lg:inline" role="status">{sessionError}</span>}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-900">
            <UserRound size={17} aria-hidden="true" />
          </span>
          <div className="max-w-44">
            <p className="truncate text-xs font-bold text-buyme-navy">{sessionLoading ? "Verifying session…" : sessionUser?.fullName ?? "Loading profile…"}</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-wide text-buyme-secondary">
              {sessionLoading ? "Admin" : sessionUser?.email ?? (isStoreAdmin ? "Store Admin" : "Super Admin")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-buyme-primary"
          aria-label="Sign out of all devices"
        >
          <LogOut size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Sign out everywhere</span>
        </button>
      </div>
    </header>
  );
}
