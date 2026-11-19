"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, ArrowLeftRight, Plus, RotateCcw, Send, XCircle } from "lucide-react";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { StockTransfer, Store, WarehouseStock } from "@/lib/api/models";
import { EmptyState, ErrorState, LoadingState, PageHeader, Surface } from "@/components/admin/States";
import { useAdminData } from "@/context/AdminContext";

type TransferLine = { productId: string; requestedQuantity: number };
type ReceiveLine = { productId: string; receivedQuantity: number; notes?: string };
type ResolutionLine = { productId: string; resolution: "WRITE_OFF" | "RETURN_TO_WAREHOUSE" };

function statusStyle(status: StockTransfer["status"]): string {
  if (status === "DISPATCHED") return "bg-blue-50 text-blue-800";
  if (status === "RECEIVED_PARTIAL") return "bg-amber-100 text-amber-950";
  if (status === "RECEIVED_FULL" || status === "RESOLVED") return "bg-emerald-50 text-emerald-800";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-600";
  return "bg-rose-50 text-buyme-primary";
}

export default function TransfersPage() {
  const { sessionUser, sessionLoading } = useAdminData();
  if (sessionLoading) return <LoadingState label="Loading operations portal…" />;
  if (sessionUser?.role === "STORE_ADMIN") return <StoreTransferReceivingPage />;
  return <SuperAdminTransfersPage />;
}

function StoreTransferReceivingPage() {
  const { sessionUser } = useAdminData();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api.GET("/api/v1/transfers");
      const nextTransfers = unwrapApiResponse<StockTransfer[]>(result);
      setTransfers(nextTransfers);
      setSelectedId((current) => current && nextTransfers.some((transfer) => transfer.id === current)
        ? current
        : nextTransfers[0]?.id ?? "");
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransfers();
  }, [loadTransfers]);

  const selected = transfers.find((transfer) => transfer.id === selectedId) ?? null;

  const submitReceipt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || selected.status !== "DISPATCHED") return;
    const items = selected.items.map((item) => ({
      productId: item.masterProductId,
      receivedQuantity: receivedQuantities[`${selected.id}:${item.masterProductId}`]
        ?? item.dispatchedQuantity,
    }));
    if (items.some((item, index) =>
      !Number.isInteger(item.receivedQuantity) ||
      item.receivedQuantity < 0 ||
      item.receivedQuantity > selected.items[index].dispatchedQuantity
    )) {
      setActionError("Each received quantity must be a whole number between zero and the dispatched quantity.");
      return;
    }

    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const result = await api.POST("/api/v1/transfers/{id}/receive", {
        params: { path: { id: selected.id } },
        body: { items },
      });
      unwrapApiResponse<unknown>(result);
      setNotice(`Receipt recorded for ${selected.transferNumber}.`);
      await loadTransfers();
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading incoming transfers…" />;

  return (
    <>
      <PageHeader
        eyebrow={sessionUser?.store?.code ?? "Store operations"}
        title="Incoming transfers"
        description="Record the quantities physically received at your assigned store. Discrepancies are sent to Super Admin for resolution."
      />
      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}
      {loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadTransfers()} />
      ) : transfers.length === 0 ? (
        <EmptyState title="No incoming transfers" description="Warehouse dispatches for your assigned store will appear here." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)]">
          <Surface>
            <h2 className="font-heading text-base font-extrabold text-buyme-navy">Transfer history</h2>
            <ul className="mt-3 space-y-2">
              {transfers.map((transfer) => (
                <li key={transfer.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(transfer.id)}
                    aria-current={selectedId === transfer.id ? "true" : undefined}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedId === transfer.id
                        ? "border-buyme-primary bg-rose-50"
                        : "border-slate-200 bg-white hover:border-rose-200"
                    }`}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-buyme-navy">{transfer.transferNumber}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">{transfer.status.replaceAll("_", " ")}</span>
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-500">{new Date(transfer.createdAt).toLocaleString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Surface>

          {selected && (
            <Surface>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-buyme-primary">Transfer details</p>
                  <h2 className="mt-1 font-heading text-lg font-extrabold text-buyme-navy">{selected.transferNumber}</h2>
                  <p className="mt-1 text-xs text-slate-500">{selected.items.length} product lines</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(selected.status)}`}>{selected.status.replaceAll("_", " ")}</span>
              </div>
              {selected.status === "DISPATCHED" ? (
                <form onSubmit={(event) => void submitReceipt(event)} className="space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full min-w-[560px] text-left">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-bold">Product</th>
                          <th scope="col" className="px-4 py-3 font-bold">Sent</th>
                          <th scope="col" className="px-4 py-3 font-bold">Received</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selected.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-buyme-navy">{item.masterProduct.name}</p>
                              <p className="text-[11px] text-slate-500">{item.masterProduct.sku}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{item.dispatchedQuantity}</td>
                            <td className="px-4 py-3">
                              <input
                                aria-label={`Received quantity for ${item.masterProduct.name}`}
                                type="number"
                                min={0}
                                max={item.dispatchedQuantity}
                                step={1}
                                value={receivedQuantities[`${selected.id}:${item.masterProductId}`] ?? item.dispatchedQuantity}
                                onChange={(event) => setReceivedQuantities((current) => ({
                                  ...current,
                                  [`${selected.id}:${item.masterProductId}`]: Number(event.target.value),
                                }))}
                                className="min-h-10 w-28 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">Enter zero or a lower quantity when goods are missing. Differences are recorded for Super Admin review.</p>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-buyme-primary px-4 text-sm font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60 sm:w-auto"
                  >
                    <ArrowDownToLine size={17} aria-hidden="true" /> {saving ? "Recording…" : "Record received quantities"}
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {selected.status === "RECEIVED_PARTIAL"
                      ? "Receipt saved with a discrepancy. Super Admin resolution is required."
                      : selected.status === "RECEIVED_FULL"
                        ? "All dispatched items were received."
                        : `This transfer is ${selected.status.toLocaleLowerCase().replaceAll("_", " ")}.`}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {selected.items.map((item) => (
                      <li key={item.id} className="flex flex-wrap justify-between gap-x-4">
                        <span>{item.masterProduct.name}</span>
                        <span>Sent {item.dispatchedQuantity} · received {item.receivedQuantity ?? "—"} · difference {item.discrepancyQuantity ?? "—"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Surface>
          )}
        </div>
      )}
    </>
  );
}

function SuperAdminTransfersPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [stock, setStock] = useState<WarehouseStock[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [destinationStoreId, setDestinationStoreId] = useState("");
  const [draftProductId, setDraftProductId] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [draftItems, setDraftItems] = useState<TransferLine[]>([]);
  const [receipt, setReceipt] = useState<ReceiveLine[]>([]);
  const [resolutions, setResolutions] = useState<Record<string, ResolutionLine["resolution"]>>({});
  const [resolutionNote, setResolutionNote] = useState("");

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [transferResult, storeResult, stockResult] = await Promise.all([
        api.GET("/api/v1/transfers"),
        api.GET("/api/v1/stores/admin"),
        api.GET("/api/v1/warehouse/stock"),
      ]);
      const nextTransfers = unwrapApiResponse<StockTransfer[]>(transferResult);
      const storeList = unwrapApiResponse<{ count: number; stores: Store[] }>(storeResult);
      const stockList = unwrapApiResponse<WarehouseStock[]>(stockResult);
      setTransfers(nextTransfers);
      setStores(storeList.stores);
      setStock(stockList);
      setSelectedId((current) => current && nextTransfers.some((item) => item.id === current)
        ? current
        : nextTransfers[0]?.id ?? "");
      setDestinationStoreId((current) => current || storeList.stores.find((store) => store.isActive)?.id || "");
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const selected = useMemo(
    () => transfers.find((transfer) => transfer.id === selectedId) ?? null,
    [selectedId, transfers],
  );
  const activeStores = useMemo(() => stores.filter((store) => store.isActive), [stores]);
  const discrepantItems = useMemo(
    () => selected?.items.filter((item) => (item.discrepancyQuantity ?? 0) > 0) ?? [],
    [selected],
  );

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setSaving(true);
    setNotice("");
    setActionError("");
    try {
      await action();
      setNotice(successMessage);
      await loadData();
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const addDraftItem = () => {
    const quantity = Number(draftQuantity);
    if (!draftProductId || !Number.isInteger(quantity) || quantity < 1) {
      setActionError("Select a product and enter a positive whole-number quantity.");
      return;
    }
    if (draftItems.some((item) => item.productId === draftProductId)) {
      setActionError("A product can only be added once to a transfer.");
      return;
    }
    setActionError("");
    setDraftItems((items) => [...items, { productId: draftProductId, requestedQuantity: quantity }]);
    setDraftProductId("");
    setDraftQuantity("1");
  };

  const createTransfer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!destinationStoreId || draftItems.length === 0) {
      setActionError("Choose a destination store and add at least one product.");
      return;
    }
    await runAction(async () => {
      const result = await api.POST("/api/v1/transfers", {
        body: { storeId: destinationStoreId, items: draftItems },
      });
      unwrapApiResponse<unknown>(result);
      setDraftItems([]);
    }, "Draft transfer created. Dispatch it when warehouse stock is ready.");
  };

  const dispatch = (transferId: string) => runAction(async () => {
    const result = await api.POST("/api/v1/transfers/{id}/dispatch", { params: { path: { id: transferId } } });
    unwrapApiResponse<unknown>(result);
  }, "Transfer dispatched from the main warehouse.");

  const cancel = (transferId: string) => runAction(async () => {
    const result = await api.POST("/api/v1/transfers/{id}/cancel", { params: { path: { id: transferId } } });
    unwrapApiResponse<unknown>(result);
  }, "Draft transfer cancelled.");

  const revert = (transferId: string) => runAction(async () => {
    const result = await api.POST("/api/v1/transfers/{id}/revert", { params: { path: { id: transferId } } });
    unwrapApiResponse<unknown>(result);
  }, "Unreceived dispatch reverted to the warehouse.");

  const receive = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const lines = selected.items.map((item) => ({
      productId: item.masterProductId,
      receivedQuantity: receipt.find((line) => line.productId === item.masterProductId)?.receivedQuantity
        ?? item.dispatchedQuantity,
    }));
    void runAction(async () => {
      const result = await api.POST("/api/v1/transfers/{id}/receive", {
        params: { path: { id: selected.id } },
        body: { items: lines },
      });
      unwrapApiResponse<unknown>(result);
    }, "Receipt recorded by the destination store.");
  };

  const resolve = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !resolutionNote.trim()) {
      setActionError("Enter a resolution note before closing the discrepancy.");
      return;
    }
    const items: ResolutionLine[] = [];
    for (const item of discrepantItems) {
      const resolution = resolutions[item.masterProductId];
      if (!resolution) {
        setActionError("Choose a resolution for every discrepant product.");
        return;
      }
      items.push({ productId: item.masterProductId, resolution });
    }
    void runAction(async () => {
      const result = await api.POST("/api/v1/transfers/{id}/resolve", {
        params: { path: { id: selected.id } },
        body: { items, resolutionNote: resolutionNote.trim() },
      });
      unwrapApiResponse<unknown>(result);
      setResolutionNote("");
    }, "Discrepancy decisions saved and transfer resolved.");
  };

  const setReceiptQuantity = (productId: string, value: string) => {
    setReceipt((current) => {
      const line = current.find((item) => item.productId === productId);
      const nextLine: ReceiveLine = { productId, receivedQuantity: Number(value) };
      return line
        ? current.map((item) => item.productId === productId ? nextLine : item)
        : [...current, nextLine];
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Stock movement"
        title="Transfers & discrepancies"
        description="Create warehouse dispatches, record store receipts, and resolve quantity differences with an auditable decision."
      />

      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}
      {loading ? (
        <LoadingState label="Loading transfers and stock…" />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadData()} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.4fr)]">
          <div className="space-y-5">
            <Surface>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
                  <Plus size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-heading text-sm font-extrabold text-buyme-navy">Create a transfer</h2>
                  <p className="text-xs text-slate-500">Dispatching reserves stock from the main warehouse.</p>
                </div>
              </div>
              <form onSubmit={(event) => void createTransfer(event)} className="space-y-3">
                <div>
                  <label htmlFor="transfer-store" className="mb-1.5 block text-xs font-bold text-slate-700">Destination store</label>
                  <select
                    id="transfer-store"
                    required
                    value={destinationStoreId}
                    onChange={(event) => setDestinationStoreId(event.target.value)}
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                  >
                    <option value="">Select a store</option>
                    {activeStores.map((store) => <option key={store.id} value={store.id}>{store.code} · {store.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-[1fr_90px] gap-2">
                  <div>
                    <label htmlFor="transfer-product" className="mb-1.5 block text-xs font-bold text-slate-700">Warehouse product</label>
                    <select
                      id="transfer-product"
                      value={draftProductId}
                      onChange={(event) => setDraftProductId(event.target.value)}
                      className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                    >
                      <option value="">Select product</option>
                      {stock.map(({ masterProduct, quantityOnHand, quantityReserved }) => (
                        <option key={masterProduct.id} value={masterProduct.id}>
                          {masterProduct.name} · avail {quantityOnHand - quantityReserved}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="transfer-quantity" className="mb-1.5 block text-xs font-bold text-slate-700">Qty</label>
                    <input
                      id="transfer-quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={draftQuantity}
                      onChange={(event) => setDraftQuantity(event.target.value)}
                      className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </div>
                <button type="button" onClick={addDraftItem} className="min-h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-buyme-primary">
                  Add product line
                </button>
                {draftItems.length > 0 && (
                  <ul className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                    {draftItems.map((item) => {
                      const product = stock.find((entry) => entry.masterProduct.id === item.productId)?.masterProduct;
                      return (
                        <li key={item.productId} className="flex items-center justify-between gap-2">
                          <span className="truncate">{product?.name ?? item.productId} × {item.requestedQuantity}</span>
                          <button
                            type="button"
                            onClick={() => setDraftItems((items) => items.filter((line) => line.productId !== item.productId))}
                            aria-label={`Remove ${product?.name ?? "product"} from transfer`}
                            className="rounded p-1 text-slate-500 hover:bg-white hover:text-red-700"
                          >
                            <XCircle size={16} aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <button type="submit" disabled={saving || !activeStores.length || !stock.length} className="min-h-10 w-full rounded-lg bg-buyme-primary px-4 text-xs font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-50">
                  {saving ? "Creating…" : "Create draft transfer"}
                </button>
              </form>
            </Surface>

            <Surface className="p-0">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div>
                  <h2 className="font-heading text-sm font-extrabold text-buyme-navy">Transfer history</h2>
                  <p className="mt-1 text-xs text-slate-500">{transfers.length} records</p>
                </div>
                <ArrowLeftRight size={18} className="text-buyme-primary" aria-hidden="true" />
              </div>
              {transfers.length === 0 ? (
                <div className="p-4"><EmptyState title="No transfers yet" description="Create a draft to start a warehouse-to-store stock movement." /></div>
              ) : (
                <div className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
                  {transfers.map((transfer) => (
                    <button
                      key={transfer.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(transfer.id);
                        setReceipt(transfer.items.map((item) => ({ productId: item.masterProductId, receivedQuantity: item.dispatchedQuantity })));
                        setActionError("");
                      }}
                      className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${selectedId === transfer.id ? "bg-rose-50/70" : "bg-white/70"}`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-buyme-navy">{transfer.transferNumber}</span>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle(transfer.status)}`}>{transfer.status.replaceAll("_", " ")}</span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">{transfer.toStore.code} · {transfer.toStore.name}</span>
                      <span className="mt-1 block text-[11px] text-slate-400">{transfer.items.length} product lines</span>
                    </button>
                  ))}
                </div>
              )}
            </Surface>
          </div>

          <Surface className="min-h-[480px]">
            {!selected ? (
              <EmptyState title="Select a transfer" description="Choose a transfer record to view its state and available actions." />
            ) : (
              <>
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-buyme-primary">{selected.transferNumber}</p>
                    <h2 className="mt-1 font-heading text-xl font-extrabold text-buyme-navy">{selected.toStore.name}</h2>
                    <p className="mt-1 text-xs text-slate-500">Created {new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-extrabold ${statusStyle(selected.status)}`}>{selected.status.replaceAll("_", " ")}</span>
                </div>

                <div className="mt-4 divide-y divide-slate-100">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
                      <div className="min-w-[180px] flex-1">
                        <p className="text-sm font-bold text-buyme-navy">{item.masterProduct.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.masterProduct.sku} · dispatched {item.dispatchedQuantity || "—"}</p>
                      </div>
                      <div className="text-right text-xs text-slate-600">
                        <p>Requested <strong>{item.requestedQuantity}</strong></p>
                        <p>Received <strong>{item.receivedQuantity ?? "—"}</strong></p>
                        {(item.discrepancyQuantity ?? 0) > 0 && <p className="mt-1 font-bold text-amber-800">Difference {item.discrepancyQuantity}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {selected.status === "DRAFT" && (
                    <>
                      <button type="button" disabled={saving} onClick={() => dispatch(selected.id)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-buyme-primary px-4 text-xs font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-50">
                        <Send size={15} aria-hidden="true" /> Dispatch
                      </button>
                      <button type="button" disabled={saving} onClick={() => cancel(selected.id)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-red-200 hover:text-red-800 disabled:opacity-50">
                        <XCircle size={15} aria-hidden="true" /> Cancel draft
                      </button>
                    </>
                  )}
                  {selected.status === "DISPATCHED" && (
                    <>
                      <form onSubmit={receive} className="w-full space-y-3">
                        <div className="flex items-start gap-2 text-xs text-slate-600">
                          <ArrowDownToLine size={16} className="mt-0.5 text-buyme-primary" aria-hidden="true" />
                          <p>Enter the actual quantity received at the store. A lower quantity creates a discrepancy for review.</p>
                        </div>
                        {selected.items.map((item) => {
                          const current = receipt.find((line) => line.productId === item.masterProductId)?.receivedQuantity ?? item.dispatchedQuantity;
                          return (
                            <div key={item.id} className="grid grid-cols-[1fr_100px] items-center gap-3">
                              <label htmlFor={`received-${item.masterProductId}`} className="text-xs font-semibold text-slate-700">{item.masterProduct.name} <span className="font-normal text-slate-500">/ {item.dispatchedQuantity} dispatched</span></label>
                              <input
                                id={`received-${item.masterProductId}`}
                                type="number"
                                min="0"
                                max={item.dispatchedQuantity}
                                step="1"
                                required
                                value={current}
                                onChange={(event) => setReceiptQuantity(item.masterProductId, event.target.value)}
                                className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                              />
                            </div>
                          );
                        })}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button type="submit" disabled={saving} className="min-h-10 rounded-lg bg-buyme-primary px-4 text-xs font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-50">Record receipt</button>
                          <button type="button" disabled={saving} onClick={() => revert(selected.id)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:border-amber-200 hover:text-amber-900 disabled:opacity-50">
                            <RotateCcw size={15} aria-hidden="true" /> Revert before receipt
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                  {selected.status === "RECEIVED_PARTIAL" && (
                    <form onSubmit={resolve} className="w-full space-y-4">
                      <div>
                        <h3 className="font-heading text-sm font-extrabold text-buyme-navy">Resolve quantity differences</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-600">Choose what should happen to each outstanding in-transit quantity. The API records immutable movements and the resolution note.</p>
                      </div>
                      {discrepantItems.map((item) => (
                        <div key={item.id} className="grid gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 sm:grid-cols-[1fr_220px] sm:items-center">
                          <div>
                            <p className="text-sm font-bold text-buyme-navy">{item.masterProduct.name}</p>
                            <p className="text-xs text-amber-900">Outstanding: {item.discrepancyQuantity}</p>
                          </div>
                          <label className="sr-only" htmlFor={`resolution-${item.masterProductId}`}>Resolution for {item.masterProduct.name}</label>
                          <select
                            id={`resolution-${item.masterProductId}`}
                            required
                            value={resolutions[item.masterProductId] ?? ""}
                            onChange={(event) => setResolutions((current) => ({
                              ...current,
                              [item.masterProductId]: event.target.value as ResolutionLine["resolution"],
                            }))}
                            className="min-h-10 rounded-lg border border-amber-200 bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-amber-200"
                          >
                            <option value="">Choose action</option>
                            <option value="RETURN_TO_WAREHOUSE">Return to warehouse</option>
                            <option value="WRITE_OFF">Write off as loss</option>
                          </select>
                        </div>
                      ))}
                      <label htmlFor="resolution-note" className="block text-xs font-bold text-slate-700">Resolution note</label>
                      <textarea
                        id="resolution-note"
                        required
                        minLength={3}
                        maxLength={1000}
                        value={resolutionNote}
                        onChange={(event) => setResolutionNote(event.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                      />
                      <button type="submit" disabled={saving} className="min-h-10 rounded-lg bg-buyme-primary px-4 text-xs font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-50">Resolve discrepancy</button>
                    </form>
                  )}
                </div>
              </>
            )}
          </Surface>
        </div>
      )}
    </>
  );
}
