"use client";

import React from "react";
import { Users, Phone, Mail, MapPin, Award, ShoppingBag } from "lucide-react";

interface CustomersViewProps {
  customers: any[];
}

export default function CustomersView({ customers }: CustomersViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Registered Customers & Loyalty
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Customer directory with verified delivery addresses, order counts, and loyalty points.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-red-500/10"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#B80022] text-white font-heading font-black text-sm flex items-center justify-center shadow-md shadow-red-500/20">
                  {c.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#10243B]">
                    {c.name}
                  </h3>
                  <span className="text-xs text-[#62748A] block">{c.email}</span>
                </div>
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-[#E4002B]" />
                  <span>{c.phone}</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{c.address || `${c.defaultAddress?.street}, ${c.defaultAddress?.city}`}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-red-50/60 border border-blue-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Orders</span>
                  <strong className="text-base font-extrabold text-[#10243B] font-heading">
                    {c.totalOrders} orders
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Loyalty Points</span>
                  <strong className="text-base font-extrabold text-amber-600 font-heading">
                    ⭐ {c.loyaltyPoints} pts
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-[#62748A] text-right">
              Locality: <strong className="text-[#10243B]">{c.locality || "Batticaloa"}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

