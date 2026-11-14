"use client";

import React, { useState } from "react";
import { Boxes, AlertTriangle, Plus, Minus, ArrowRightLeft, X, Check, Search, Filter } from "lucide-react";
import storesData from "../../../../shared/data/stores.json";

interface InventoryViewProps {
  inventory: any[];
  onAdjustStock: (productId: string, storeId: string, delta: number) => void;
}

export default function InventoryView({
  inventory,
  onAdjustStock,
}: InventoryViewProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState("br-btc-01");
  const [adjustmentDelta, setAdjustmentDelta] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Batticaloa District Multi-Store Inventory
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Real-time warehouse SKU tracking across 10 BuyMe stores in Eastern Province.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/80 border border-slate-200/80 rounded-full text-xs font-medium text-[#10243B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[#62748A] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-4 px-5">SKU Code</th>
                <th className="py-4 px-4">Product Name</th>
                <th className="py-4 px-3">Batti Town</th>
                <th className="py-4 px-3">Kattankudy</th>
                <th className="py-4 px-3">Eravur</th>
                <th className="py-4 px-3">Valaichenai</th>
                <th className="py-4 px-3">Oddamavadi</th>
                <th className="py-4 px-3">Chenkalady</th>
                <th className="py-4 px-3">Kaluwanchikudy</th>
                <th className="py-4 px-3">Arayampathy</th>
                <th className="py-4 px-3">Kiran</th>
                <th className="py-4 px-3">Vellavely</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const getStock = (bId: string) => {
                  const s = item.storeStocks?.find((b: any) => b.storeId === bId);
                  if (s) return s.quantity;
                  if (item.storeStock && item.storeStock[bId] !== undefined) return item.storeStock[bId];
                  return 15;
                };

                return (
                  <tr key={item.productId} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#E4002B] whitespace-nowrap">
                      {item.sku}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#10243B] min-w-[180px]">
                      {item.productName}
                    </td>

                    {/* 10 Store Stock Columns */}
                    {storesData.map((store) => {
                      const qty = getStock(store.id);
                      const isLow = qty <= 5;
                      return (
                        <td key={store.id} className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`font-heading font-extrabold px-1.5 py-0.5 rounded text-[11px] ${
                              isLow
                                ? "bg-amber-100 text-amber-800"
                                : "text-[#10243B]"
                            }`}
                          >
                            {qty}
                          </span>
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1.5 rounded-full bg-red-50 text-[#E4002B] hover:bg-blue-100 text-xs font-bold transition-all"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Dialog */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-[#10243B] font-heading">
              BuyMe Stock Rebalancing (Demo)
            </h3>
            <p className="text-xs text-[#62748A] mt-1">
              Adjust physical quantity for <strong>{selectedItem.productName}</strong>
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#10243B] block mb-1">Target Batticaloa Store</label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#10243B] focus:outline-none cursor-pointer"
                >
                  {storesData.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.locality})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#10243B] block mb-1">Quantity Adjustment (+/-)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAdjustmentDelta(Math.max(-50, adjustmentDelta - 5))}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    value={adjustmentDelta}
                    onChange={(e) => setAdjustmentDelta(Number(e.target.value))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-sm font-extrabold font-heading text-[#E4002B] focus:outline-none"
                  />
                  <button
                    onClick={() => setAdjustmentDelta(adjustmentDelta + 5)}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#10243B] block mb-1">Audit Reason</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#62748A] focus:outline-none">
                  <option>Warehouse Supplier Restock Batch</option>
                  <option>Store Shelf Replenishment</option>
                  <option>Inventory Audit Correction</option>
                  <option>Damaged or Expired Stock Write-off</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-[#62748A] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onAdjustStock(selectedItem.productId, selectedStoreId, adjustmentDelta);
                    setSelectedItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-full bg-[#E4002B] hover:bg-[#B80022] text-white text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Commit Stock</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
