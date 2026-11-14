"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, Store, Shield, LogOut, User, Menu } from "lucide-react";
import { useAdminData } from "@/context/AdminContext";

export default function TopNav() {
  const router = useRouter();
  const {
    selectedStore,
    setSelectedStore,
    globalSearch,
    setGlobalSearch,
    stores,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useAdminData();
  const [session, setSession] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("buyme_session");
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("buyme_session");
    router.push("/login");
  };

  return (
    <header className="h-16 px-4 md:px-8 bg-white/70 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-20 flex items-center justify-between shadow-[0_4px_20px_rgba(31,36,48,0.02)]">
      {/* Mobile Drawer Button + Search Input */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 max-w-xs md:max-w-md">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-[#E4002B] hover:bg-red-50 rounded-xl transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search orders, SKU..."
            className="w-full bg-white/90 border border-gray-200 rounded-full pl-10 pr-4 py-1.5 text-xs text-[#1F2430] placeholder-gray-400 focus:outline-none focus:border-[#E4002B] focus:ring-2 focus:ring-red-100 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Right Cluster Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Store Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 border border-gray-200 rounded-full px-2.5 sm:px-3.5 py-1.5 shadow-sm max-w-[130px] sm:max-w-none">
          <Store className="w-3.5 h-3.5 text-[#E4002B] flex-shrink-0" />
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#1F2430] focus:outline-none cursor-pointer pr-1 truncate w-full"
          >
            <option value="all">All Stores (10 Hubs)</option>
            {stores.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name || s.storeName} ({s.location || s.locality})
              </option>
            ))}
          </select>
        </div>

        {/* User Session Info & Sign Out */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-100 text-[#E4002B] flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#1F2430] leading-none">
                {session?.name || "Admin Staff"}
              </div>
              <div className="text-[10px] text-[#E4002B] font-semibold uppercase tracking-wider">
                {session?.role === "main_admin" ? "HQ Admin" : "Store Admin"}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 text-gray-400 hover:text-[#E4002B] hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
