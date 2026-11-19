"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Barcode, Boxes, Search, X } from "lucide-react";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { WarehouseStock } from "@/lib/api/models";
import { EmptyState, ErrorState, formatLkr, LoadingState, PageHeader, Surface } from "@/components/admin/States";

export default function InventoryPage() {
  const [stock, setStock] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [quantityDelta, setQuantityDelta] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const loadStock = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api.GET("/api/v1/warehouse/stock");
      setStock(unwrapApiResponse<WarehouseStock[]>(result));
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStock();
  }, []);

  const filteredStock = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return stock;
    return stock.filter(({ masterProduct }) => {
      const values = [
        masterProduct.name,
        masterProduct.nameTa,
        masterProduct.sku,
        masterProduct.barcode,
        ...masterProduct.barcodes.map(({ barcode }) => barcode),
      ];
      return values.some((value) => value?.toLocaleLowerCase().includes(search));
    });
  }, [query, stock]);

  const submitAdjustment = async (event: FormEvent<HTMLFormElement>, productId: string) => {
    event.preventDefault();
    const delta = Number(quantityDelta);
    if (!Number.isInteger(delta) || delta === 0 || !reason.trim()) {
      setActionError("Enter a non-zero whole-number change and a reason.");
      return;
    }

    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const result = await api.POST("/api/v1/warehouse/stock/{productId}/adjust", {
        params: { path: { productId } },
        body: { quantityDelta: delta, reason: reason.trim() },
      });
      unwrapApiResponse<unknown>(result);
      setNotice("Warehouse stock adjustment recorded.");
      setAdjustingId(null);
      setQuantityDelta("");
      setReason("");
      await loadStock();
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const stockCount = stock.length;
  const lowStockCount = stock.filter((entry) =>
    entry.quantityOnHand - entry.quantityReserved <= entry.reorderLevel
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Warehouse operations"
        title="Main inventory"
        description="Search products by name, SKU, or barcode and record auditable stock adjustments against the main warehouse."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Surface className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
            <Boxes size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-500">Tracked products</p>
            <p className="font-heading text-xl font-extrabold text-buyme-navy">{loading ? "—" : stockCount}</p>
          </div>
        </Surface>
        <Surface className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <Barcode size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-500">At or below reorder level</p>
            <p className="font-heading text-xl font-extrabold text-buyme-navy">{loading ? "—" : lowStockCount}</p>
          </div>
        </Surface>
      </div>

      <Surface>
        <label htmlFor="inventory-search" className="mb-2 block text-sm font-bold text-buyme-navy">
          Product search or barcode entry
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
          <input
            id="inventory-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a product name, SKU, or scan a barcode"
            className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-buyme-primary focus:ring-4 focus:ring-rose-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </Surface>

      {notice && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}

      <div className="mt-5">
        {loading ? (
          <LoadingState label="Loading main warehouse stock…" />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={() => void loadStock()} />
        ) : filteredStock.length === 0 ? (
          <EmptyState
            title={stock.length ? "No matching products" : "No warehouse stock recorded"}
            description={stock.length ? "Try a different product name, SKU, or barcode." : "Products will appear here once they have main-warehouse stock records."}
          />
        ) : (
          <Surface className="p-0">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:px-5">
              <h2 className="font-heading text-base font-extrabold text-buyme-navy">Warehouse stock ledger</h2>
              <p className="text-xs text-slate-500">Changes are validated and recorded by the API.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="bg-slate-50/90 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-bold">Product</th>
                    <th scope="col" className="px-4 py-3 font-bold">Barcode / SKU</th>
                    <th scope="col" className="px-4 py-3 font-bold">On hand</th>
                    <th scope="col" className="px-4 py-3 font-bold">Reserved</th>
                    <th scope="col" className="px-4 py-3 font-bold">Available</th>
                    <th scope="col" className="px-4 py-3 font-bold">Cost</th>
                    <th scope="col" className="px-5 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map((entry) => {
                    const product = entry.masterProduct;
                    const available = entry.quantityOnHand - entry.quantityReserved;
                    const low = available <= entry.reorderLevel;
                    return (
                      <React.Fragment key={entry.id}>
                        <tr className="align-middle">
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-buyme-navy">{product.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{product.category?.name ?? "Uncategorised"} · {product.unit}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-mono text-xs text-slate-700">{product.barcode}</p>
                            <p className="mt-1 font-mono text-[11px] text-slate-400">{product.sku}</p>
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-buyme-navy">{entry.quantityOnHand}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">{entry.quantityReserved}</td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${low ? "bg-amber-100 text-amber-950" : "bg-emerald-50 text-emerald-800"}`}>
                              {available} {low ? "Low" : "Available"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{formatLkr(product.costPrice)}</td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");
                                setAdjustingId(adjustingId === product.id ? null : product.id);
                              }}
                              className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:text-buyme-primary"
                            >
                              Adjust stock
                            </button>
                          </td>
                        </tr>
                        {adjustingId === product.id && (
                          <tr>
                            <td colSpan={7} className="bg-rose-50/60 px-4 py-4 sm:px-5">
                              <form onSubmit={(event) => void submitAdjustment(event, product.id)} className="grid gap-3 sm:grid-cols-[minmax(120px,0.4fr)_minmax(220px,1fr)_auto] sm:items-end">
                                <div>
                                  <label htmlFor={`delta-${product.id}`} className="mb-1.5 block text-xs font-bold text-slate-700">Quantity change (+/-)</label>
                                  <input
                                    id={`delta-${product.id}`}
                                    type="number"
                                    step="1"
                                    required
                                    value={quantityDelta}
                                    onChange={(event) => setQuantityDelta(event.target.value)}
                                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`reason-${product.id}`} className="mb-1.5 block text-xs font-bold text-slate-700">Reason</label>
                                  <input
                                    id={`reason-${product.id}`}
                                    type="text"
                                    minLength={3}
                                    maxLength={500}
                                    required
                                    value={reason}
                                    onChange={(event) => setReason(event.target.value)}
                                    placeholder="e.g. Supplier delivery or damaged goods"
                                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  disabled={saving}
                                  className="min-h-10 rounded-lg bg-buyme-primary px-4 text-xs font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-60"
                                >
                                  {saving ? "Saving…" : "Record adjustment"}
                                </button>
                              </form>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Surface>
        )}
      </div>
    </>
  );
}
