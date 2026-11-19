"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Search, Warehouse } from "lucide-react";
import { EmptyState, ErrorState, formatLkr, LoadingState, PageHeader, Surface } from "@/components/admin/States";
import { useAdminData } from "@/context/AdminContext";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { StoreAlert, StoreStockItem } from "@/lib/api/models";

export default function StoreStockPage() {
  const { sessionUser, sessionLoading } = useAdminData();
  const storeId = sessionUser?.store?.id ?? "";
  const [stock, setStock] = useState<StoreStockItem[]>([]);
  const [alerts, setAlerts] = useState<StoreAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [quantityDelta, setQuantityDelta] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setLoadError("");
    try {
      const [stockResult, alertResult] = await Promise.all([
        api.GET("/api/v1/stores/{storeId}/stock", { params: { path: { storeId } } }),
        api.GET("/api/v1/stores/{storeId}/alerts", { params: { path: { storeId } } }),
      ]);
      setStock(unwrapApiResponse<StoreStockItem[]>(stockResult));
      setAlerts(unwrapApiResponse<StoreAlert[]>(alertResult));
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) void loadData();
  }, [loadData, storeId]);

  const filteredStock = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return stock;
    return stock.filter(({ masterProduct }) => [
      masterProduct.name,
      masterProduct.nameTa,
      masterProduct.sku,
      masterProduct.barcode,
      ...masterProduct.barcodes.map(({ barcode }) => barcode),
    ].some((value) => value?.toLocaleLowerCase().includes(search)));
  }, [query, stock]);

  const adjustStock = async (event: FormEvent<HTMLFormElement>, productId: string) => {
    event.preventDefault();
    const delta = Number(quantityDelta);
    if (!Number.isInteger(delta) || delta === 0 || reason.trim().length < 3) {
      setActionError("Enter a non-zero whole-number change and a reason of at least 3 characters.");
      return;
    }

    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const result = await api.POST("/api/v1/stores/{storeId}/stock/{productId}/adjust", {
        params: { path: { storeId, productId } },
        body: { quantityDelta: delta, reason: reason.trim() },
      });
      unwrapApiResponse<unknown>(result);
      setNotice("Store stock adjustment recorded.");
      setEditingProductId("");
      setQuantityDelta("");
      setReason("");
      await loadData();
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    setActionError("");
    setNotice("");
    try {
      const result = await api.PATCH("/api/v1/stores/{storeId}/alerts/{alertId}/acknowledge", {
        params: { path: { storeId, alertId } },
      });
      unwrapApiResponse<unknown>(result);
      setNotice("Store alert acknowledged.");
      await loadData();
    } catch (error) {
      setActionError(describeApiError(error));
    }
  };

  if (sessionLoading) return <LoadingState label="Loading assigned store…" />;
  if (!storeId) return <ErrorState message="This Store Admin account has no assigned store. Contact a Super Admin." />;
  if (loading) return <LoadingState label="Loading store stock and alerts…" />;

  const lowStockCount = stock.filter(
    (item) => item.quantityOnHand - item.quantityReserved <= item.reorderLevel,
  ).length;

  return (
    <>
      <PageHeader
        eyebrow={sessionUser?.store?.code ?? "Store operations"}
        title="Store stock"
        description="Review available and reserved quantities, handle low-stock alerts, and record auditable stock adjustments for your assigned store."
      />

      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}
      {loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadData()} />
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <Surface className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
                <Warehouse size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500">Tracked products</p>
                <p className="font-heading text-xl font-extrabold text-buyme-navy">{stock.length}</p>
              </div>
            </Surface>
            <Surface className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                <AlertTriangle size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500">Products at or below reorder level</p>
                <p className="font-heading text-xl font-extrabold text-buyme-navy">{lowStockCount}</p>
              </div>
            </Surface>
          </div>

          {alerts.length > 0 && (
            <Surface className="mb-5">
              <h2 className="font-heading text-base font-extrabold text-buyme-navy">Open store alerts</h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <li key={alert.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-bold text-buyme-navy">{alert.alertType.replaceAll("_", " ")}</p>
                        <p className="text-xs text-slate-600">{alert.masterProduct?.name ?? "Store operation alert"}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void acknowledgeAlert(alert.id)}
                      className="inline-flex min-h-9 items-center justify-center gap-1 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-buyme-primary sm:self-auto"
                    >
                      <Check size={14} aria-hidden="true" /> Acknowledge
                    </button>
                  </li>
                ))}
              </ul>
            </Surface>
          )}

          <Surface>
            <label htmlFor="store-stock-search" className="mb-2 block text-sm font-bold text-buyme-navy">Search products</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input
                id="store-stock-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Product name, SKU, or barcode"
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-buyme-primary focus:ring-4 focus:ring-rose-100"
              />
            </div>
          </Surface>

          <div className="mt-5">
            {filteredStock.length === 0 ? (
              <EmptyState
                title={stock.length ? "No matching products" : "No store stock recorded"}
                description={stock.length ? "Try another name, SKU, or barcode." : "Products will appear after they are added to this store's catalogue."}
              />
            ) : (
              <Surface className="p-0">
                <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                  <h2 className="font-heading text-base font-extrabold text-buyme-navy">Store stock ledger</h2>
                  <p className="mt-1 text-xs text-slate-500">Every adjustment is validated and logged by the API.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead className="bg-slate-50/90 text-[11px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th scope="col" className="px-5 py-3 font-bold">Product</th>
                        <th scope="col" className="px-4 py-3 font-bold">On hand</th>
                        <th scope="col" className="px-4 py-3 font-bold">Reserved</th>
                        <th scope="col" className="px-4 py-3 font-bold">Available</th>
                        <th scope="col" className="px-4 py-3 font-bold">Price</th>
                        <th scope="col" className="px-5 py-3 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStock.map((item) => {
                        const available = item.quantityOnHand - item.quantityReserved;
                        const low = available <= item.reorderLevel;
                        return (
                          <React.Fragment key={item.id}>
                            <tr>
                              <td className="px-5 py-4">
                                <p className="text-sm font-bold text-buyme-navy">{item.masterProduct.name}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{item.masterProduct.sku} · {item.masterProduct.unit}</p>
                              </td>
                              <td className="px-4 py-4 text-sm font-bold text-buyme-navy">{item.quantityOnHand}</td>
                              <td className="px-4 py-4 text-sm text-slate-600">{item.quantityReserved}</td>
                              <td className="px-4 py-4">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${low ? "bg-amber-100 text-amber-950" : "bg-emerald-50 text-emerald-800"}`}>
                                  {available} {low ? "Low" : "Available"}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600">
                                {formatLkr(item.customPrice ?? item.masterProduct.baseSellingPrice)}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionError("");
                                    setEditingProductId(editingProductId === item.masterProductId ? "" : item.masterProductId);
                                  }}
                                  className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:text-buyme-primary"
                                >
                                  Adjust stock
                                </button>
                              </td>
                            </tr>
                            {editingProductId === item.masterProductId && (
                              <tr>
                                <td colSpan={6} className="bg-rose-50/60 px-4 py-4 sm:px-5">
                                  <form onSubmit={(event) => void adjustStock(event, item.masterProductId)} className="grid gap-3 sm:grid-cols-[minmax(120px,0.4fr)_minmax(220px,1fr)_auto] sm:items-end">
                                    <div>
                                      <label htmlFor={`store-delta-${item.masterProductId}`} className="mb-1.5 block text-xs font-bold text-slate-700">Quantity change (+/-)</label>
                                      <input
                                        id={`store-delta-${item.masterProductId}`}
                                        type="number"
                                        step="1"
                                        required
                                        value={quantityDelta}
                                        onChange={(event) => setQuantityDelta(event.target.value)}
                                        className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor={`store-reason-${item.masterProductId}`} className="mb-1.5 block text-xs font-bold text-slate-700">Reason</label>
                                      <input
                                        id={`store-reason-${item.masterProductId}`}
                                        type="text"
                                        required
                                        minLength={3}
                                        maxLength={500}
                                        value={reason}
                                        onChange={(event) => setReason(event.target.value)}
                                        className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                                      />
                                    </div>
                                    <button
                                      type="submit"
                                      disabled={saving}
                                      className="min-h-10 rounded-lg bg-buyme-primary px-4 text-xs font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60"
                                    >
                                      {saving ? "Saving…" : "Record change"}
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
      )}
    </>
  );
}
