"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  ShieldCheck,
  Store,
  TrendingUp,
} from "lucide-react";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { ReportOverview, RiderReviewQueue, StockTransfer, StoreList, WarehouseStock } from "@/lib/api/models";
import { EmptyState, ErrorState, formatLkr, LoadingState, PageHeader, Surface } from "@/components/admin/States";

interface OverviewData {
  report: ReportOverview;
  stores: StoreList;
  stock: WarehouseStock[];
  riders: RiderReviewQueue;
  transfers: StockTransfer[];
}

const cards = [
  { key: "orders", label: "Orders · 30 days", icon: ClipboardList, color: "bg-blue-50 text-blue-800" },
  { key: "revenue", label: "Delivered revenue", icon: TrendingUp, color: "bg-emerald-50 text-emerald-800" },
  { key: "stock", label: "Low-stock products", icon: Boxes, color: "bg-amber-50 text-amber-900" },
  { key: "kyc", label: "Rider KYC awaiting review", icon: ShieldCheck, color: "bg-rose-50 text-buyme-primary" },
] as const;

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const [reportResult, storeResult, stockResult, riderResult, transferResult] = await Promise.all([
        api.GET("/api/v1/reports/overview"),
        api.GET("/api/v1/stores/admin"),
        api.GET("/api/v1/warehouse/stock"),
        api.GET("/api/v1/riders/review-queue", { params: { query: { page: 1, pageSize: 1 } } }),
        api.GET("/api/v1/transfers"),
      ]);
      setData({
        report: unwrapApiResponse<ReportOverview>(reportResult),
        stores: unwrapApiResponse<StoreList>(storeResult),
        stock: unwrapApiResponse<WarehouseStock[]>(stockResult),
        riders: unwrapApiResponse<RiderReviewQueue>(riderResult),
        transfers: unwrapApiResponse<StockTransfer[]>(transferResult),
      });
    } catch (requestError) {
      setError(describeApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const lowStock = data?.stock.filter((item) =>
    item.quantityOnHand - item.quantityReserved <= item.reorderLevel
  ).length ?? 0;
  const metricValues = {
    orders: data?.report.summary.orders.toLocaleString() ?? "—",
    revenue: data ? formatLkr(data.report.summary.revenue) : "—",
    stock: data ? String(lowStock) : "—",
    kyc: data ? String(data.riders.total) : "—",
  };

  return (
    <>
      <PageHeader
        eyebrow="Live operations"
        title="Super Admin overview"
        description="A current view of warehouse health, store operations, rider verification, and delivered sales."
        action={
          <div className="rounded-xl border border-white bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500">Active stores</p>
            <p className="font-heading text-lg font-extrabold text-buyme-navy">
              {loading ? "—" : data?.stores.stores.filter((store) => store.isActive).length ?? 0}
              <span className="ml-1 text-xs font-semibold text-slate-500">/ {data?.stores.count ?? "—"}</span>
            </p>
          </div>
        }
      />

      {error && <div className="mb-5"><ErrorState message={error} onRetry={() => void loadOverview()} /></div>}
      {loading ? (
        <LoadingState label="Loading live Super Admin metrics…" />
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ key, label, icon: Icon, color }) => (
              <Surface key={key} className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-1 break-words font-heading text-xl font-extrabold text-buyme-navy">{metricValues[key]}</p>
                </div>
              </Surface>
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Surface>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-extrabold text-buyme-navy">Recent stock transfers</h2>
                  <p className="mt-1 text-xs text-slate-500">Live transfer state from the API.</p>
                </div>
                <Link href="/admin/transfers" className="inline-flex items-center gap-1 text-xs font-bold text-buyme-primary hover:underline">
                  View all <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
              {!data.transfers.length ? (
                <EmptyState title="No transfers recorded" description="Create a warehouse-to-store transfer when stock is ready to move." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.transfers.slice(0, 5).map((transfer) => (
                    <div key={transfer.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-buyme-navy">{transfer.transferNumber}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{transfer.toStore.code} · {transfer.toStore.name} · {transfer.items.length} lines</p>
                      </div>
                      <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">{transfer.status.replaceAll("_", " ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </Surface>

            <Surface>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <BarChart3 size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-heading text-base font-extrabold text-buyme-navy">Delivered sales</h2>
                  <p className="text-xs text-slate-500">Last 30 days, all stores</p>
                </div>
              </div>
              <p className="font-heading text-2xl font-extrabold text-buyme-navy">{formatLkr(data.report.summary.revenue)}</p>
              <p className="mt-1 text-xs text-slate-500">{data.report.summary.deliveredOrders.toLocaleString()} delivered orders</p>
              <div className="mt-5 space-y-2" role="img" aria-label="Recent daily sales order count">
                {data.report.daily.slice(-7).map((day) => {
                  const peak = Math.max(1, ...data.report.daily.slice(-7).map((item) => item.orders));
                  return (
                    <div key={day.day} className="grid grid-cols-[48px_1fr_24px] items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">{day.day.slice(5)}</span>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-buyme-primary to-buyme-yellow" style={{ width: `${Math.max(3, (day.orders / peak) * 100)}%` }} />
                      </div>
                      <span className="text-right text-[10px] font-bold text-slate-700">{day.orders}</span>
                    </div>
                  );
                })}
              </div>
              <Link href="/admin/reports" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-buyme-primary hover:underline">
                Open reports <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </Surface>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/admin/stores" className="group rounded-2xl border border-white bg-white/90 p-4 shadow-sm transition hover:border-rose-200 hover:shadow-glass">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary"><Store size={18} aria-hidden="true" /></span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-buyme-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 font-heading text-sm font-extrabold text-buyme-navy">Manage stores</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{data.stores.count} store records · settings and service hours</p>
            </Link>
            <Link href="/admin/inventory" className="group rounded-2xl border border-white bg-white/90 p-4 shadow-sm transition hover:border-rose-200 hover:shadow-glass">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary"><Boxes size={18} aria-hidden="true" /></span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-buyme-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 font-heading text-sm font-extrabold text-buyme-navy">Main inventory</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{data.stock.length} stock records · {lowStock} at or below reorder level</p>
            </Link>
          </div>
        </>
      ) : (
        <EmptyState title="Overview unavailable" description="The API returned no overview data." />
      )}
    </>
  );
}
