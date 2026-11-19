"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Download } from "lucide-react";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { ReportOverview, Store, StoreList } from "@/lib/api/models";
import { EmptyState, ErrorState, formatLkr, LoadingState, PageHeader, Surface } from "@/components/admin/States";

function dateValue(date: Date): string {
  const shifted = new Date(date.getTime() + 330 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

function colomboMidnightUtc(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day) - 330 * 60 * 1000);
}

function nextDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const today = dateValue(new Date());
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 29);
    return dateValue(date);
  });
  const [to, setTo] = useState(today);
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [report, setReport] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const start = colomboMidnightUtc(from).toISOString();
      const end = colomboMidnightUtc(nextDay(to)).toISOString();
      const [reportResult, storeResult] = await Promise.all([
        api.GET("/api/v1/reports/overview", {
          params: {
            query: {
              from: start,
              to: end,
              ...(storeId ? { storeId } : {}),
            },
          },
        }),
        api.GET("/api/v1/stores/admin"),
      ]);
      setReport(unwrapApiResponse<ReportOverview>(reportResult));
      setStores(unwrapApiResponse<StoreList>(storeResult).stores);
    } catch (requestError) {
      setError(describeApiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const maxDailyOrders = useMemo(
    () => Math.max(1, ...(report?.daily.map((item) => item.orders) ?? [0])),
    [report],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (from >= to) {
      setError("Choose a start date before the end date.");
      return;
    }
    void loadReport();
  };

  const downloadCsv = () => {
    if (!report) return;
    const rows = [
      ["Date", "Orders", "Delivered", "Cancelled/failed", "Delivered revenue (LKR)"],
      ...report.daily.map((item) => [
        item.day,
        String(item.orders),
        String(item.deliveredOrders),
        String(item.cancelledOrders),
        String(item.revenue),
      ]),
    ];
    const csv = rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `buyme-report-${from}-to-${to}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <PageHeader
        eyebrow="Business intelligence"
        title="Reports"
        description="Live order and delivered-revenue aggregates from the API, grouped by Batticaloa business date."
        action={
          <button type="button" onClick={downloadCsv} disabled={!report || loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 text-xs font-bold text-slate-700 transition hover:border-rose-200 hover:text-buyme-primary disabled:opacity-50">
            <Download size={16} aria-hidden="true" /> Export CSV
          </button>
        }
      />

      <Surface>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_auto] lg:items-end">
          <div>
            <label htmlFor="report-from" className="mb-1.5 block text-xs font-bold text-slate-700">From</label>
            <input id="report-from" type="date" required value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="setting-input" />
          </div>
          <div>
            <label htmlFor="report-to" className="mb-1.5 block text-xs font-bold text-slate-700">To</label>
            <input id="report-to" type="date" required value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} className="setting-input" />
          </div>
          <div>
            <label htmlFor="report-store" className="mb-1.5 block text-xs font-bold text-slate-700">Store</label>
            <select id="report-store" value={storeId} onChange={(event) => setStoreId(event.target.value)} className="setting-input">
              <option value="">All stores</option>
              {stores.map((store) => <option key={store.id} value={store.id}>{store.code} · {store.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-buyme-primary px-4 text-sm font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-50">
            <CalendarDays size={16} aria-hidden="true" /> Apply
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">The API limits reports to 90 days. Day boundaries use Asia/Colombo.</p>
      </Surface>

      {error && <div className="mt-4"><ErrorState message={error} onRetry={() => void loadReport()} /></div>}
      {loading ? (
        <div className="mt-5"><LoadingState label="Loading report aggregates…" /></div>
      ) : report ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Orders", value: report.summary.orders.toLocaleString() },
              { label: "Delivered", value: report.summary.deliveredOrders.toLocaleString() },
              { label: "Cancelled / failed", value: report.summary.cancelledOrders.toLocaleString() },
              { label: "Delivered revenue", value: formatLkr(report.summary.revenue) },
            ].map((metric) => (
              <Surface key={metric.label}>
                <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
                <p className="mt-2 break-words font-heading text-xl font-extrabold text-buyme-navy">{metric.value}</p>
              </Surface>
            ))}
          </div>
          <Surface className="mt-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
                <BarChart3 size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-base font-extrabold text-buyme-navy">Daily orders</h2>
                <p className="text-xs text-slate-500">{from} through {to} · {storeId ? "selected store" : "all stores"}</p>
              </div>
            </div>
            {report.daily.length === 0 ? (
              <EmptyState title="No orders in this date range" description="Try widening the selected dates or choose all stores." />
            ) : (
              <div className="space-y-2" role="img" aria-label="Daily order counts">
                {report.daily.map((item) => (
                  <div key={item.day} className="grid grid-cols-[78px_1fr_50px] items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">{item.day.slice(5)}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full min-w-1 rounded-full bg-gradient-to-r from-buyme-primary to-buyme-yellow"
                        style={{ width: `${Math.max(3, (item.orders / maxDailyOrders) * 100)}%` }}
                      />
                    </div>
                    <span className="text-right text-xs font-bold text-buyme-navy">{item.orders}</span>
                  </div>
                ))}
              </div>
            )}
          </Surface>
        </>
      ) : (
        <div className="mt-5"><EmptyState title="No report data" description="The report API did not return an aggregate for this selection." /></div>
      )}
    </>
  );
}
