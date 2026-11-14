"use client";

import React, { useState } from "react";
import { Store, MapPin, Phone, Mail, Clock, Plus, Star, CheckCircle, AlertCircle, X } from "lucide-react";

interface StoresViewProps {
  stores: any[];
  onToggleStatus: (storeId: string) => void;
}

export default function StoresView({ stores, onToggleStatus }: StoresViewProps) {
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreCity, setNewStoreCity] = useState("Batticaloa");
  const [newStoreAddress, setNewStoreAddress] = useState("Main Street, Kokkodicholai, Batticaloa");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Multi-Store Superstore Network
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Configure physical hubs, fulfillment radius, operational hours, and live statuses.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-full bg-[#E4002B] text-white text-xs font-bold hover:bg-[#B80022] transition-colors flex items-center gap-1.5 shadow-md shadow-red-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store (Demo)</span>
        </button>
      </div>

      {/* Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => {
          const isActive = store.status === "active";
          return (
            <div
              key={store.id}
              className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-red-500/10"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-200">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-400 text-white"
                    }`}
                  >
                    {store.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-red-200 font-heading">
                    {store.province}
                  </span>
                  <h3 className="font-heading font-extrabold text-lg leading-tight">
                    {store.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs text-[#62748A]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#E4002B] shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{store.operatingHours}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Delivery Radius</span>
                    <strong className="text-[#10243B] font-heading">{store.deliveryRadiusKm} km coverage</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Store Rating</span>
                    <strong className="text-amber-500 font-heading flex items-center justify-end gap-1">
                      <Star className="w-3 h-3 fill-amber-500" /> {store.rating}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => onToggleStatus(store.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {isActive ? "Deactivate Store" : "Activate Store"}
                  </button>
                  <button
                    onClick={() => setSelectedStore(store)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-[#E4002B] font-bold text-xs hover:bg-red-100 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Store Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-extrabold text-[#10243B] font-heading">
              Add Proposed Store (Batticaloa District)
            </h3>
            <p className="text-xs text-[#62748A] mt-1">
              Add a new delivery fulfillment store to your Batticaloa network.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#10243B] block mb-1">Store Name</label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="e.g. BuyMe Kokkodicholai"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#10243B] block mb-1">District / Region</label>
                <input
                  type="text"
                  value={newStoreCity}
                  onChange={(e) => setNewStoreCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#10243B] block mb-1">Address</label>
                <input
                  type="text"
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast("? Proposed Batticaloa store registered!");
                  setIsAddModalOpen(false);
                }}
                className="px-5 py-2 rounded-full bg-[#E4002B] text-white text-xs font-bold hover:bg-[#B80022]"
              >
                Create Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

