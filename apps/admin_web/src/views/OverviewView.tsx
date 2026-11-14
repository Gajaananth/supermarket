"use client";

import React, { useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Bike,
  Users,
  Store,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface OverviewViewProps {
  orders: any[];
  stores: any[];
  products: any[];
  riders: any[];
  customers: any[];
  onNavigateToOrders: () => void;
}

export default function OverviewView({
  orders,
  stores,
  products,
  riders,
  customers,
  onNavigateToOrders,
}: OverviewViewProps) {
  // Calculations matching real dataset
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.totalAmount !== undefined ? o.totalAmount : (o.total || 0)),
    0
  );
  const pendingCount = orders.filter((o) =>
    ["pending", "confirmed", "preparing"].includes(o.orderStatus || o.status)
  ).length;
  const completedCount = orders.filter(
    (o) => (o.orderStatus || o.status) === "delivered"
  ).length;
  const activeDeliveriesCount = orders.filter((o) =>
    ["ready_for_pickup", "out_for_delivery"].includes(o.orderStatus || o.status)
  ).length;
  const onlineRidersCount = riders.filter(
    (r) => r.status === "available" || r.status === "delivering" || r.status === "online" || r.isOnline
  ).length;

  // Chart data matching Batticaloa district scale
  const revenueTrendData = [
    { day: "Mon", revenue: 42000, orders: 15 },
    { day: "Tue", revenue: 48500, orders: 18 },
    { day: "Wed", revenue: 51200, orders: 19 },
    { day: "Thu", revenue: 46800, orders: 17 },
    { day: "Fri", revenue: 58400, orders: 21 },
    { day: "Sat", revenue: 64200, orders: 24 },
    { day: "Sun (Today)", revenue: totalRevenue > 0 ? totalRevenue : 59130, orders: orders.length },
  ];

  const maxRev = Math.max(...revenueTrendData.map((d) => d.revenue));

  const storePerformanceData = [
    { name: "BuyMe Batticaloa Town", revenue: 18500, orders: 7 },
    { name: "BuyMe Kattankudy", revenue: 14200, orders: 5 },
    { name: "BuyMe Eravur", revenue: 10800, orders: 4 },
    { name: "BuyMe Valaichenai", revenue: 8600, orders: 3 },
    { name: "BuyMe Chenkalady", revenue: 7030, orders: 3 },
  ];

  const statusDistributionData = [
    { name: "Delivered", value: completedCount, color: "#10B981" },
    { name: "Out for Delivery", value: activeDeliveriesCount, color: "#F59E0B" },
    { name: "Preparing", value: pendingCount, color: "#E4002B" },
    { name: "Cancelled", value: 1, color: "#94A3B8" },
  ];

  const totalStatusCount = statusDistributionData.reduce((acc, cur) => acc + cur.value, 0) || 1;

  // SVG Area path generation for Revenue Trend Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 60;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const points = revenueTrendData.map((d, i) => {
    const x = padLeft + (i / (revenueTrendData.length - 1)) * chartW;
    const y = padTop + chartH - (d.revenue / (maxRev * 1.15)) * chartH;
    return { x, y, ...d };
  });

  const lineD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");
  const areaD = `${lineD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  // SVG Donut slices generation
  let cumulativeAngle = 0;
  const donutSlices = statusDistributionData.map((slice) => {
    const sliceAngle = (slice.value / totalStatusCount) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;

    const r = 60;
    const cx = 100;
    const cy = 100;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path =
      slice.value === totalStatusCount
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r}`
        : `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;

    return { ...slice, path, sliceAngle };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1F2430] tracking-tight font-heading">
            Executive Operations Overview
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Real-time store delivery metrics and financial intelligence across Batticaloa District, Sri Lanka.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All 10 Stores Online
          </span>
        </div>
      </div>

      {/* KPI Cards Grid (8 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Today Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#1F2430] font-heading">
            LKR {totalRevenue.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs last week</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#1F2430] font-heading">
            {orders.length} Orders
          </div>
          <div className="mt-1 text-xs text-[#6B7280] font-medium">
            Across 10 stores
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Active Deliveries
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#E4002B] font-heading">
            {activeDeliveriesCount} On Route
          </div>
          <div className="mt-1 text-xs text-[#6B7280]">
            Avg delivery time: 24 mins
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Completed Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-600 font-heading">
            {completedCount} Delivered
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-bold">
            98.5% On-Time Rate
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Pending Prep
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-amber-600 font-heading">
            {pendingCount} Pending
          </div>
          <div className="mt-1 text-xs text-[#6B7280]">
            Packing at store stations
          </div>
        </div>

        {/* Metric 6 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Registered Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#1F2430] font-heading">
            {customers.length} Profiles
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-bold">
            +3 new today
          </div>
        </div>

        {/* Metric 7 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Active Stores
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#1F2430] font-heading">
            {stores.length} Superstores
          </div>
          <div className="mt-1 text-xs text-[#6B7280]">
            Puliyanthivu, Kattankudy, Eravur
          </div>
        </div>

        {/* Metric 8 */}
        <div className="p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_30px_rgba(31,36,48,0.04)] transition-all hover:-translate-y-1 hover:shadow-red-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider font-heading">
              Rider Fleet
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E4002B] flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-[#1F2430] font-heading">
            {onlineRidersCount} / {riders.length} Active
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-bold">
            Fleet capacity ready
          </div>
        </div>
      </div>

      {/* Analytics Charts Section (100% Responsive SVG Vector Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_32px_rgba(31,36,48,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1F2430] font-heading">
                Weekly Revenue Performance (LKR)
              </h3>
              <p className="text-xs text-[#6B7280]">
                Daily sales trajectory across 10 Batticaloa grocery store pools
              </p>
            </div>
            <span className="text-xs bg-red-50 text-[#E4002B] font-bold px-3 py-1 rounded-full border border-red-100">
              7-Day Trend
            </span>
          </div>

          <div className="w-full">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="buyMeRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E4002B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#E4002B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = padTop + chartH * (1 - pct);
                const val = Math.round((maxRev * 1.15 * pct) / 1000);
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#9CA3AF"
                      fontFamily="sans-serif"
                    >
                      {val}k
                    </text>
                  </g>
                );
              })}

              {/* Filled Area */}
              <path d={areaD} fill="url(#buyMeRevenueGrad)" />

              {/* Red Stroke Curve */}
              <path
                d={lineD}
                fill="none"
                stroke="#E4002B"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & X labels */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#FFFFFF"
                    stroke="#E4002B"
                    strokeWidth="2.5"
                  />
                  <text
                    x={p.x}
                    y={padTop + chartH + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill="#6B7280"
                    fontFamily="sans-serif"
                  >
                    {p.day}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Order Status Distribution Donut */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_32px_rgba(31,36,48,0.04)] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-base font-extrabold text-[#1F2430] font-heading">
              Order Status Breakdown
            </h3>
            <p className="text-xs text-[#6B7280]">Live distribution of 22 orders</p>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <svg viewBox="0 0 200 200" className="w-48 h-48">
              {donutSlices.map((slice, idx) => (
                <path
                  key={idx}
                  d={slice.path}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="22"
                  strokeLinecap="round"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-[#1F2430] font-heading leading-none">
                {orders.length}
              </span>
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mt-1">
                Orders
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 text-xs">
            {statusDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-[#6B7280] text-[11px] font-medium truncate">{item.name}</span>
                <span className="font-bold text-[#1F2430] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Store Performance & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Performance Comparison */}
        <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_32px_rgba(31,36,48,0.04)]">
          <div className="mb-4">
            <h3 className="text-base font-extrabold text-[#1F2430] font-heading">
              Store Performance Comparison
            </h3>
            <p className="text-xs text-[#6B7280]">Today's volume by store location</p>
          </div>

          <div className="space-y-4 mt-6">
            {storePerformanceData.map((b, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#1F2430]">
                  <span>{b.name}</span>
                  <span className="text-[#E4002B]">
                    LKR {b.revenue.toLocaleString()} ({b.orders} orders)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#E4002B] to-[#FFC20E] h-full rounded-full"
                    style={{ width: `${(b.revenue / 22000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-3 rounded-2xl bg-red-50/70 border border-red-100 text-xs text-[#B80022]">
            <strong>Insights:</strong> BuyMe Batticaloa Town & Kattankudy hubs drive 55% of district order volume, with peak evening demand for fresh lagoon catch, dairy, and staple grains.
          </div>
        </div>

        {/* Recent Orders Quick Preview */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_32px_rgba(31,36,48,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1F2430] font-heading">
                Recent Orders Stream
              </h3>
              <p className="text-xs text-[#6B7280]">Live customer requests</p>
            </div>
            <button
              onClick={onNavigateToOrders}
              className="text-xs font-bold text-[#E4002B] hover:text-[#B80022] flex items-center gap-1 transition-all"
            >
              <span>View All {orders.length} Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[#6B7280] uppercase font-bold text-[10px]">
                  <th className="pb-3">Order Ref</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Store</th>
                  <th className="pb-3">Total (LKR)</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Rider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-red-50/40 transition-colors">
                    <td className="py-3 font-bold text-[#1F2430] font-heading">
                      {order.orderNumber || order.id}
                    </td>
                    <td className="py-3 font-medium text-[#1F2430]">{order.customerName}</td>
                    <td className="py-3 text-[#6B7280]">
                      {(order.storeName || "").split(" ")[0]}
                    </td>
                    <td className="py-3 font-bold text-[#1F2430]">
                      LKR {Number(order.totalAmount || order.total || 0).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          (order.orderStatus || order.status) === "delivered"
                            ? "bg-emerald-100 text-emerald-700"
                            : (order.orderStatus || order.status) === "out_for_delivery"
                            ? "bg-amber-100 text-amber-800"
                            : (order.orderStatus || order.status) === "preparing"
                            ? "bg-red-100 text-[#E4002B]"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {(order.orderStatus || order.status || "").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-[#6B7280]">{order.riderName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
