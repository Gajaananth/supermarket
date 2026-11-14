"use client";

import React, { useState } from "react";
import { Download, Calendar, BarChart2, TrendingUp, FileSpreadsheet } from "lucide-react";

interface ReportsViewProps {
  orders: any[];
  stores: any[];
  products: any[];
}

export default function ReportsView({
  orders,
  stores,
  products,
}: ReportsViewProps) {
  const [dateRange, setDateRange] = useState("today");

  // Export to CSV Functionality
  const exportToCSV = () => {
    const headers = ["Order Reference,Customer,Store,Total LKR,Payment Method,Status,Created At\n"];
    const rows = orders.map(
      (o) =>
        `"${o.orderNumber}","${o.customerName}","${o.storeName}",${o.total},"${o.paymentMethod}","${o.orderStatus}","${o.createdAt}"\n`
    );
    const blob = new Blob([headers.concat(rows).join("")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BuyMe_Batticaloa_Sales_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Executive Analytics & Reports
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Export fiscal statements, track store performance, and download CSV spreadsheets.
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV (Spreadsheet)</span>
        </button>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)]">
          <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider font-heading">
            Total Gross Sales
          </span>
          <div className="mt-2 text-2xl font-extrabold text-[#10243B] font-heading">
            LKR 284,500.00
          </div>
          <span className="text-xs text-emerald-600 font-bold block mt-1">+14.2% Month-over-Month</span>
        </div>

        <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)]">
          <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider font-heading">
            Average Order Value (AOV)
          </span>
          <div className="mt-2 text-2xl font-extrabold text-[#E4002B] font-heading">
            LKR 2,640.00
          </div>
          <span className="text-xs text-[#62748A] block mt-1">Based on 108 sample orders</span>
        </div>

        <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)]">
          <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider font-heading">
            On-Time Fulfillment Rate
          </span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 font-heading">
            96.8%
          </div>
          <span className="text-xs text-emerald-600 font-bold block mt-1">Target: &gt;95%</span>
        </div>
      </div>

      {/* Detailed Orders Audit Log */}
      <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-base text-[#10243B]">
            Fiscal Audit Log (Ready for Export)
          </h3>
          <span className="text-xs text-slate-400">All prices in LKR</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[#62748A] uppercase font-bold text-[10px]">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Store Location</th>
                <th className="pb-3">Subtotal</th>
                <th className="pb-3">Delivery Fee</th>
                <th className="pb-3">Net Total</th>
                <th className="pb-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 font-bold font-heading">{o.orderNumber}</td>
                  <td className="py-2.5 text-[#62748A]">{o.storeName}</td>
                  <td className="py-2.5">LKR {Number(o.itemsTotal || o.subtotal || 0).toLocaleString()}</td>
                  <td className="py-2.5 text-slate-400">LKR {Number(o.deliveryFee || 250).toLocaleString()}</td>
                  <td className="py-2.5 font-bold text-[#10243B]">LKR {Number(o.totalAmount || o.total || 0).toLocaleString()}</td>
                  <td className="py-2.5">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">
                      {o.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

