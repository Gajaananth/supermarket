"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, Heart, LogOut, ArrowLeft } from "lucide-react";

export default function CustomerAccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("buyme_session");
      if (!stored) {
        router.push("/login?redirect=/shop/account");
        return;
      }
      setSession(JSON.parse(stored));
    } catch (e) {
      router.push("/login?redirect=/shop/account");
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("buyme_session");
    router.push("/login");
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FFFDFD] aurora-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#E4002B] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDFD] aurora-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#E4002B]">
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#E4002B]"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="glass-surface-elevated rounded-3xl p-6 border border-white/80 shadow-xl flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#E4002B] flex items-center justify-center text-2xl font-black shadow-inner">
            {session.name ? session.name[0] : "K"}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Verified Shopper
            </span>
            <h1 className="text-xl font-extrabold text-[#1F2430] mt-1">{session.name || "Kajan Sivanesan"}</h1>
            <p className="text-xs text-gray-500">📍 {session.address || "14/2 Puliyanthivu, Batticaloa"} • 10 Hub Network</p>
          </div>
        </div>

        {/* Account Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-surface rounded-2xl p-4 border border-white/80 space-y-1">
            <Package className="w-5 h-5 text-[#E4002B]" />
            <h3 className="font-bold text-sm text-[#1F2430]">Active Orders (1)</h3>
            <p className="text-xs text-gray-500">Track current doorstep delivery</p>
          </div>
          <div className="glass-surface rounded-2xl p-4 border border-white/80 space-y-1">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-[#1F2430]">Saved Locations</h3>
            <p className="text-xs text-gray-500">Home, Office & Family addresses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
