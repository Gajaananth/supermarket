"use client";

import React, { useState } from "react";
import { MapPin, Bike, Navigation, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface DeliveriesViewProps {
  orders: any[];
  riders: any[];
  stores: any[];
}

export default function DeliveriesView({
  orders,
  riders,
  stores,
}: DeliveriesViewProps) {
  const activeOrders = orders.filter((o) =>
    ["ready_for_pickup", "out_for_delivery"].includes(o.orderStatus)
  );
  const [selectedDelivery, setSelectedDelivery] = useState<any>(activeOrders[0] || orders[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Live Fleet & Delivery Telemetry (Simulated)
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Visual map monitoring of orders in-transit across Batticaloa District (Batticaloa Town, Kattankudy, Eravur, Valaichenai, etc.).
          </p>
        </div>
        <div className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>SIMULATED GPS TELEMETRY (DEMO)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders List */}
        <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-base text-[#10243B]">
              Active In-Transit Orders
            </h3>
            <span className="text-xs bg-blue-100 text-[#B80022] font-bold px-2 py-0.5 rounded-full">
              {activeOrders.length} Live
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {activeOrders.map((order) => {
              const isSelected = selectedDelivery?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedDelivery(order)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-red-50/80 border-[#E4002B] shadow-md shadow-red-500/10"
                      : "bg-white/80 border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-sm text-[#10243B]">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                      {(order.orderStatus || order.status || "active").replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="mt-2 text-xs space-y-1 text-[#62748A]">
                    <div className="flex items-center gap-1.5 text-[#10243B] font-semibold">
                      <Bike className="w-3.5 h-3.5 text-[#E4002B]" />
                      <span>Rider: {order.riderName || "Pending Assignment"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{order.deliveryAddress.street || order.deliveryAddress}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total: LKR {Number(order.totalAmount || order.total || 0).toLocaleString()}</span>
                    <span className="font-bold text-[#E4002B]">Est: 20-35 mins</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Map Simulation Container */}
        <div className="lg:col-span-2 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] overflow-hidden flex flex-col">
          {/* Map Visual (Styled vector canvas) */}
          <div className="relative flex-1 min-h-[400px] bg-gradient-to-br from-slate-100 via-sky-50 to-blue-50 flex items-center justify-center p-8 overflow-hidden">
            {/* Grid Lines Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#E4002B 1px, transparent 1px), radial-gradient(#E4002B 1px, #f0f5fd 1px)",
                backgroundSize: "24px 24px",
                backgroundPosition: "0 0, 12px 12px",
              }}
            ></div>

            {/* Simulated Road Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 150 180 Q 320 220 480 160 T 700 240"
                fill="none"
                stroke="#E4002B"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-pulse"
              />
            </svg>

            {/* Marker 1: Store Origin */}
            <div className="absolute left-[18%] top-[35%] flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border-2 border-[#E4002B] flex items-center justify-center text-[#E4002B] animate-bounce">
                <MapPin className="w-6 h-6 fill-[#E4002B] text-white" />
              </div>
              <span className="mt-2 text-xs font-bold bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow text-[#10243B]">
                BuyMe Batticaloa Town Hub
              </span>
            </div>

            {/* Marker 2: Moving Rider */}
            <div className="absolute left-[48%] top-[30%] flex flex-col items-center z-10">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#E4002B] to-[#B80022] shadow-xl text-white flex items-center justify-center ring-4 ring-red-200 animate-pulse">
                <Bike className="w-5 h-5" />
              </div>
              <span className="mt-2 text-xs font-bold bg-[#10243B] text-white px-2.5 py-0.5 rounded-full shadow">
                Kajan Sivanesan (EP BDF-4821)
              </span>
            </div>

            {/* Marker 3: Customer Destination */}
            <div className="absolute right-[18%] top-[45%] flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="mt-2 text-xs font-bold bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow text-[#10243B]">
                Kajan S. (Puliyanthivu, Batticaloa)
              </span>
            </div>

            {/* Telemetry overlay pill */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-3 shadow-lg flex items-center gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">ROUTE DISTANCE</span>
                <strong className="text-[#10243B] font-heading">3.2 km � 14 mins remaining</strong>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">DISPATCHED AT</span>
                <strong className="text-[#10243B] font-heading">09:15 AM Batticaloa Time</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

