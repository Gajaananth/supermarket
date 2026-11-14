"use client";

import React from "react";
import { UserCheck, Shield, Key, Plus } from "lucide-react";

export default function StaffView() {
  const staff = [
    { name: "Kajan Sivanesan", role: "General Operations Director", store: "All 10 Batticaloa Stores", email: "kajan.s@buyme.lk", access: "Full Executive Access" },
    { name: "Mohamed Ahamed", role: "Store Operations Lead", store: "BuyMe Kattankudy", email: "m.ahamed@buyme.lk", access: "Orders & Inventory" },
    { name: "Anton Jeroshan", role: "Regional Dispatch Controller", store: "BuyMe Eravur", email: "anton.j@buyme.lk", access: "Fleet Dispatch" },
    { name: "Niroshan Kanapathipillai", role: "Inventory Supervisor", store: "BuyMe Valaichenai", email: "niroshan.k@buyme.lk", access: "Stock Adjustment" },
    { name: "Yathushan Rasiah", role: "Store Supervisor", store: "BuyMe Kaluwanchikudy", email: "yathushan.r@buyme.lk", access: "Orders & Cash" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Staff & Role-Based Access Control
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Supervise platform operators, fulfillment staff, and store managers.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[#62748A] uppercase font-bold text-[10px] tracking-wider">
              <th className="py-4 px-6">Staff Member</th>
              <th className="py-4 px-4">Role Title</th>
              <th className="py-4 px-4">Store Jurisdiction</th>
              <th className="py-4 px-4">Permission Scope</th>
              <th className="py-4 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-[#10243B]">
                  {s.name}
                  <span className="block text-[10px] text-slate-400 font-normal">{s.email}</span>
                </td>
                <td className="py-4 px-4 text-[#10243B] font-semibold">{s.role}</td>
                <td className="py-4 px-4 text-[#62748A]">{s.store}</td>
                <td className="py-4 px-4">
                  <span className="text-[10px] bg-blue-50 text-[#0866CC] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                    {s.access}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

