"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, Check, Clock3, PackageCheck, Play, X } from "lucide-react";
import { useAdminData } from "@/context/AdminContext";
import { EmptyState, ErrorState, formatLkr, LoadingState, PageHeader, Surface } from "@/components/admin/States";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { AdminOrder, EligibleRider } from "@/lib/api/models";

function orderActionLabel(status: string): string {
  if (status === "PLACED") return "New order";
  if (status === "ACCEPTED") return "Accepted";
  if (status === "PREPARING") return "Preparing";
  if (status === "READY") return "Ready for rider";
  return status.replaceAll("_", " ");
}

export default function OrdersPage() {
  const { sessionUser, sessionLoading } = useAdminData();
  const storeId = sessionUser?.store?.id ?? "";
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [riders, setRiders] = useState<EligibleRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [alertStatus, setAlertStatus] = useState("");
  const [savingOrderId, setSavingOrderId] = useState("");
  const [riderSelections, setRiderSelections] = useState<Record<string, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const seenOrderIds = useRef<Set<string> | null>(null);
  const readyOrderIds = useRef<Set<string>>(new Set());
  const ridersLoaded = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);

  const notifyIncomingOrders = useCallback((incoming: AdminOrder[]) => {
    if (incoming.length === 0) return;
    setNotice(`${incoming.length} new order${incoming.length === 1 ? "" : "s"} received.`);
    if ("Notification" in window && Notification.permission === "granted") {
      for (const order of incoming) {
        const notification = new Notification(`New order ${order.orderNumber}`, {
          body: `${order.customer.user.fullName} · ${formatLkr(order.totalAmount)}`,
        });
        notification.onclick = () => window.focus();
      }
    }

    const context = audioContext.current;
    if (context?.state === "running") {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.36);
    }
  }, []);

  const loadOrders = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    setLoadError("");
    try {
      const ordersResult = await api.GET("/api/v1/orders", { params: { query: { limit: 50 } } });
      const nextOrders = unwrapApiResponse<AdminOrder[]>(ordersResult);
      const previousIds = seenOrderIds.current;
      if (previousIds) {
        notifyIncomingOrders(nextOrders.filter(
          (order) => order.status === "PLACED" && !previousIds.has(order.id),
        ));
      }
      seenOrderIds.current = new Set(nextOrders.map((order) => order.id));
      setOrders(nextOrders);
      const nextReadyIds = new Set(nextOrders.filter((order) => order.status === "READY").map((order) => order.id));
      const readyOrdersChanged = nextReadyIds.size !== readyOrderIds.current.size ||
        Array.from(nextReadyIds).some((id) => !readyOrderIds.current.has(id));
      if (nextReadyIds.size === 0) {
        setRiders([]);
        ridersLoaded.current = false;
      } else if (readyOrdersChanged || !ridersLoaded.current) {
        const ridersResult = await api.GET("/api/v1/orders/eligible-riders");
        setRiders(unwrapApiResponse<EligibleRider[]>(ridersResult));
        ridersLoaded.current = true;
      }
      readyOrderIds.current = nextReadyIds;
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      if (!background) setLoading(false);
    }
  }, [notifyIncomingOrders]);

  useEffect(() => {
    if (!storeId) return;
    void loadOrders();
    const interval = window.setInterval(() => void loadOrders(true), 10_000);
    return () => window.clearInterval(interval);
  }, [loadOrders, storeId]);

  const enableAlerts = async () => {
    const messages: string[] = [];
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        messages.push(permission === "granted"
          ? "Browser notifications enabled."
          : "Browser notifications were not allowed; sound alerts remain available.");
      } else {
        messages.push("This browser does not support desktop notifications.");
      }

      if (typeof AudioContext !== "undefined") {
        const context = audioContext.current ?? new AudioContext();
        audioContext.current = context;
        await context.resume();
        messages.push("Sound alerts enabled.");
      } else {
        messages.push("This browser does not support sound alerts.");
      }
      setAlertStatus(messages.join(" "));
    } catch (error) {
      setAlertStatus(describeApiError(error));
    }
  };

  const runOrderAction = async (
    order: AdminOrder,
    action: "accept" | "reject" | "preparing" | "ready" | "assign-rider",
  ) => {
    const rejectionReason = rejectionReasons[order.id]?.trim();
    const riderId = riderSelections[order.id];
    if (action === "reject" && (!rejectionReason || rejectionReason.length < 3)) {
      setActionError("Enter a rejection reason with at least 3 characters.");
      return;
    }
    if (action === "assign-rider" && !riderId) {
      setActionError("Choose an eligible rider before assigning this order.");
      return;
    }

    setSavingOrderId(order.id);
    setActionError("");
    setNotice("");
    try {
      const params = { path: { id: order.id } };
      if (action === "accept") {
        unwrapApiResponse<unknown>(await api.POST("/api/v1/orders/{id}/accept", {
          params,
          body: { note: "Accepted by store" },
        }));
      } else if (action === "reject") {
        unwrapApiResponse<unknown>(await api.POST("/api/v1/orders/{id}/reject", {
          params,
          body: { reason: rejectionReason! },
        }));
      } else if (action === "preparing") {
        unwrapApiResponse<unknown>(await api.POST("/api/v1/orders/{id}/preparing", {
          params,
          body: { note: "Preparation started" },
        }));
      } else if (action === "ready") {
        unwrapApiResponse<unknown>(await api.POST("/api/v1/orders/{id}/ready", {
          params,
          body: { note: "Order packed and ready for pickup" },
        }));
      } else {
        unwrapApiResponse<unknown>(await api.POST("/api/v1/orders/{id}/assign-rider", {
          params,
          body: { riderId },
        }));
      }
      setNotice(`Order ${order.orderNumber} updated.`);
      await loadOrders(true);
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSavingOrderId("");
    }
  };

  if (sessionLoading) return <LoadingState label="Loading assigned store…" />;
  if (!storeId) {
    return <ErrorState message="This Store Admin account has no assigned store. Contact a Super Admin." />;
  }
  if (loading) return <LoadingState label="Loading store orders…" />;

  return (
    <>
      <PageHeader
        eyebrow="Store operations"
        title="Orders & incoming alerts"
        description="Review new COD orders, move accepted orders through preparation, and assign an eligible rider for your store."
        action={
          <button
            type="button"
            onClick={() => void enableAlerts()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-950 transition hover:bg-amber-100"
          >
            <BellRing size={17} aria-hidden="true" />
            Enable alerts
          </button>
        }
      />

      {alertStatus && <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950" role="status">{alertStatus}</p>}
      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}
      {loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadOrders()} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="New orders for your assigned store will appear here. Keep this page open to receive periodic live updates." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const busy = savingOrderId === order.id;
            const canReject = order.status === "PLACED";
            return (
              <Surface key={order.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-base font-extrabold text-buyme-navy">{order.orderNumber}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        order.status === "PLACED" ? "bg-amber-100 text-amber-950" : "bg-blue-50 text-blue-800"
                      }`}>
                        {orderActionLabel(order.status)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 size={13} aria-hidden="true" />
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{order.customer.user.fullName}</p>
                    {order.customer.user.phone && (
                      <a className="mt-0.5 inline-block text-xs font-medium text-buyme-primary underline-offset-2 hover:underline" href={`tel:${order.customer.user.phone}`}>
                        {order.customer.user.phone}
                      </a>
                    )}
                    <ul className="mt-3 space-y-1 text-sm text-slate-600">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex flex-wrap justify-between gap-x-4">
                          <span>{item.quantity} × {item.storeProduct.masterProduct.name} <span className="text-xs text-slate-400">{item.storeProduct.masterProduct.unit}</span></span>
                          <span>{formatLkr(item.totalPrice)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-3 lg:min-w-56 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs font-semibold text-slate-500">COD total</p>
                    <p className="font-heading text-xl font-extrabold text-buyme-navy">{formatLkr(order.totalAmount)}</p>
                    <p className="text-[11px] text-slate-500">Subtotal {formatLkr(order.subtotal)} · delivery {formatLkr(order.deliveryFee)}</p>

                    {order.status === "PLACED" && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void runOrderAction(order, "accept")}
                          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg bg-buyme-primary px-3 text-xs font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60"
                        >
                          <Check size={15} aria-hidden="true" /> Accept
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void runOrderAction(order, "reject")}
                          className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-800 hover:bg-red-50 disabled:opacity-60"
                        >
                          <X size={15} aria-hidden="true" /> Reject
                        </button>
                        {canReject && (
                          <label className="col-span-2">
                            <span className="mb-1 block text-[11px] font-semibold text-slate-600">Rejection reason</span>
                            <input
                              value={rejectionReasons[order.id] ?? ""}
                              onChange={(event) => setRejectionReasons((current) => ({ ...current, [order.id]: event.target.value }))}
                              maxLength={500}
                              placeholder="Required to reject"
                              className="min-h-9 w-full rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {order.status === "ACCEPTED" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void runOrderAction(order, "preparing")}
                        className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-buyme-primary px-3 text-xs font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60"
                      >
                        <Play size={15} aria-hidden="true" /> Start preparation
                      </button>
                    )}
                    {order.status === "PREPARING" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void runOrderAction(order, "ready")}
                        className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-buyme-primary px-3 text-xs font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60"
                      >
                        <PackageCheck size={15} aria-hidden="true" /> Mark ready
                      </button>
                    )}
                    {order.status === "READY" && (
                      <div className="mt-2 space-y-2">
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-semibold text-slate-600">Eligible rider</span>
                          <select
                            value={riderSelections[order.id] ?? ""}
                            onChange={(event) => setRiderSelections((current) => ({ ...current, [order.id]: event.target.value }))}
                            className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                          >
                            <option value="">Select a rider</option>
                            {riders.map((rider) => (
                              <option key={rider.id} value={rider.id}>
                                {rider.user.fullName}{rider.bikeNumber ? ` · ${rider.bikeNumber}` : ""}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          disabled={busy || riders.length === 0}
                          onClick={() => void runOrderAction(order, "assign-rider")}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-buyme-primary px-3 text-xs font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60"
                        >
                          <PackageCheck size={15} aria-hidden="true" /> Assign rider
                        </button>
                        {riders.length === 0 && <p className="text-xs text-amber-900">No eligible riders are currently available.</p>}
                      </div>
                    )}
                    {order.rider && (
                      <p className="mt-2 text-xs text-slate-600">Rider: {order.rider.user.fullName}</p>
                    )}
                  </div>
                </div>
              </Surface>
            );
          })}
        </div>
      )}
    </>
  );
}
