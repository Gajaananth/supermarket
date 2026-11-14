"use client";

import React, { useState } from "react";
import { Bell, AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { useAdminData } from "@/context/AdminContext";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "alerts" | "cash">("all");

  const alerts = [
    {
      id: "nt-01",
      title: "Rider Cash Threshold Reached",
      description: "Rider Kamal Perera (RDR-002) has collected LKR 10,400 in COD cash. Shift locked pending deposit to Kattankudy Store.",
      time: "12 mins ago",
      type: "alert",
      rule: "Rule R1 (COD Threshold)",
    },
    {
      id: "nt-02",
      title: "Store Low Stock Alert",
      description: "Batticaloa Red Raw Rice (5 kg pack) has fallen below threshold of 10 units at Puliyanthivu Hub.",
      time: "28 mins ago",
      type: "warning",
      rule: "Inventory Policy",
    },
    {
      id: "nt-03",
      title: "Deposit Slip Verified",
      description: "Store Manager confirmed cash handover of LKR 8,200 from Rider Kajan Sivanesan. Shift unlocked.",
      time: "1 hr ago",
      type: "success",
      rule: "Cash Reconciliation",
    },
    {
      id: "nt-04",
      title: "New Free Delivery Campaign Active",
      description: "Tier 1: Orders over LKR 3,500 within 4.0 km eligible for 100% delivery waiver.",
      time: "3 hrs ago",
      type: "info",
      rule: "Promotions Engine",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1F2430]">Notifications & Live Alerts</h1>
          <p className="text-xs text-[#6B7280]">Real-time operational alerts for 10 Batticaloa Hubs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filter === "all" ? "bg-[#E4002B] text-white" : "bg-white border text-gray-700"
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter("cash")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              filter === "cash" ? "bg-[#E4002B] text-white" : "bg-white border text-gray-700"
            }`}
          >
            Cash Control
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((item) => (
          <div
            key={item.id}
            className="glass-surface-elevated rounded-2xl p-5 border border-white/80 shadow-sm flex items-start gap-4"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item.type === "alert"
                  ? "bg-red-100 text-[#E4002B]"
                  : item.type === "warning"
                  ? "bg-amber-100 text-amber-700"
                  : item.type === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {item.type === "alert" ? (
                <AlertTriangle className="w-5 h-5" />
              ) : item.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold text-[#1F2430]">{item.title}</h3>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.time}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
              <div className="mt-2">
                <span className="text-[10px] font-bold text-[#E4002B] bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                  {item.rule}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
