"use client";

import React, { useState } from "react";
import { Settings, Save, RefreshCw, ShieldCheck } from "lucide-react";

export default function SettingsView() {
  const [currency, setCurrency] = useState("LKR");
  const [standardFee, setStandardFee] = useState(250);
  const [minOrderFreeDelivery, setMinOrderFreeDelivery] = useState(3000);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Store & Platform Configuration
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Currency parameters, simulated delivery pricing, and prototype controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fiscal Settings */}
        <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] space-y-4">
          <h3 className="font-heading font-extrabold text-base text-[#10243B]">
            Fiscal & Delivery Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-[#10243B] block mb-1">Base Currency</label>
              <input
                type="text"
                disabled
                value="Sri Lankan Rupee (LKR)"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[#10243B] block mb-1">Standard Simulated Delivery Fee (LKR)</label>
              <input
                type="number"
                value={standardFee}
                onChange={(e) => setStandardFee(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-heading font-bold text-[#10243B] focus:outline-none focus:border-[#E4002B]"
              />
            </div>

            <div>
              <label className="font-bold text-[#10243B] block mb-1">Free Delivery Threshold (LKR)</label>
              <input
                type="number"
                value={minOrderFreeDelivery}
                onChange={(e) => setMinOrderFreeDelivery(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-heading font-bold text-[#10243B] focus:outline-none focus:border-[#E4002B]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2500);
              }}
              className="px-5 py-2.5 rounded-full bg-[#E4002B] text-white text-xs font-bold hover:bg-[#B80022] transition-colors flex items-center gap-1.5 shadow-md shadow-red-500/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                ? Parameters saved to local state
              </span>
            )}
          </div>
        </div>

        {/* Prototype Environment Notice */}
        <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-base text-[#10243B]">
              BuyMe Prototype Architecture Notice
            </h3>
            <p className="text-xs text-[#62748A] mt-2 leading-relaxed">
              This dashboard is running in <strong>BuyMe Batticaloa Presentation Mode</strong>. All mutations, status modifications, and stock adjustments take effect immediately in the local memory state.
            </p>

            <div className="mt-4 p-3.5 rounded-2xl bg-red-50/70 border border-blue-100 text-xs text-[#B80022] space-y-1">
              <strong className="block font-heading">Backend Decoupling Architecture:</strong>
              <span>
                All UI actions interact through repository interfaces, making future connection to PostgreSQL and NestJS APIs frictionless without requiring UI rework.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setResetSuccess(true);
                setTimeout(() => {
                  setResetSuccess(false);
                  window.location.reload();
                }, 1000);
              }}
              className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
            {resetSuccess && (
              <span className="text-xs font-bold text-blue-600">
                Resetting to factory defaults...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

