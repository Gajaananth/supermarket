"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Store, Bike, User, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [phone, setPhone] = useState("+94 77 123 4567");
  const [password, setPassword] = useState("demo123");

  const setDemoSessionAndGo = (role: string, name: string, defaultPath: string, extra = {}) => {
    const session = {
      role,
      name,
      createdAt: new Date().toISOString(),
      ...extra,
    };
    localStorage.setItem("buyme_session", JSON.stringify(session));
    const target = redirectUrl || defaultPath;
    router.push(target);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSessionAndGo("main_admin", "Admin Staff", "/admin/overview");
  };

  return (
    <div className="w-full max-w-lg glass-surface-elevated rounded-3xl p-6 sm:p-8 relative z-10 border border-white/80 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#E4002B] animate-pulse"></span>
          <span className="text-[11px] font-bold text-[#E4002B] tracking-wider uppercase">
            Batticaloa District • 10 Hubs
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1F2430] tracking-tight">
          Buy<span className="text-[#E4002B]">Me</span> Platform
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">Select a verified demo profile to access portal</p>
      </div>

      {/* 1-Click Demo Profiles */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-[#1F2430] uppercase tracking-wider">
          1-Click Demo Accounts
        </label>

        <button
          type="button"
          onClick={() =>
            setDemoSessionAndGo(
              "main_admin",
              "Naveen Raj (HQ Executive)",
              "/admin/overview",
              { title: "Main Admin", hub: "All 10 Hubs" }
            )
          }
          className="w-full p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#E4002B] flex items-center justify-between text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1F2430] group-hover:text-[#E4002B] transition-colors">
                Main Admin (HQ Executive)
              </div>
              <div className="text-[11px] text-gray-500">Full district control • All 10 store hubs</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E4002B] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          type="button"
          onClick={() =>
            setDemoSessionAndGo(
              "store_admin",
              "S. Thevarajah (Manager)",
              "/admin/overview",
              { title: "Store Admin", hub: "BM-S01 Batticaloa Town" }
            )
          }
          className="w-full p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#E4002B] flex items-center justify-between text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1F2430] group-hover:text-[#E4002B] transition-colors">
                Store Admin (Batticaloa Town)
              </div>
              <div className="text-[11px] text-gray-500">Store-scoped stock, order dispatch & cash drops</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E4002B] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          type="button"
          onClick={() =>
            setDemoSessionAndGo(
              "rider",
              "Kajan Sivanesan (RDR-001)",
              "/rider",
              { vehicle: "TVS Raider (BA-8821)", storeId: "BM-S01" }
            )
          }
          className="w-full p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#E4002B] flex items-center justify-between text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1F2430] group-hover:text-[#E4002B] transition-colors">
                Rider Courier (Express Logistics)
              </div>
              <div className="text-[11px] text-gray-500">Live active shift • Doorstep COD collection</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E4002B] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          type="button"
          onClick={() =>
            setDemoSessionAndGo(
              "customer",
              "Kajan Sivanesan",
              "/shop",
              { address: "Puliyanthivu, Batticaloa", locality: "Town Hub" }
            )
          }
          className="w-full p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:border-[#E4002B] flex items-center justify-between text-left transition-all hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1F2430] group-hover:text-[#E4002B] transition-colors">
                Customer (Local Shopper)
              </div>
              <div className="text-[11px] text-gray-500">Browse 42 fresh items • Doorstep delivery</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#E4002B] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-[10px] uppercase font-bold text-gray-400">Or Manual Sign In</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleManualSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#1F2430] mb-1">
            Phone / Mobile
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#E4002B]/40 focus:border-[#E4002B]"
            placeholder="e.g. +94 77 123 4567"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1F2430] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#E4002B]/40 focus:border-[#E4002B]"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#E4002B] hover:bg-[#B80022] text-white font-bold rounded-xl text-xs shadow-md shadow-red-500/20 transition-all"
        >
          Sign In with Password
        </button>
      </form>

      <div className="pt-2 text-center text-[11px] text-[#6B7280]">
        <Link href="/" className="hover:text-[#E4002B] font-semibold">
          ← Return to Ecosystem Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFD] aurora-bg flex flex-col justify-center items-center p-4 sm:p-6">
      <Suspense fallback={<div className="text-xs text-gray-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
