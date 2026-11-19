import React from "react";
import { AlertCircle, LoaderCircle, PackageSearch } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-buyme-primary">{eyebrow}</p>
        <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-buyme-navy sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading live data…" }: { label?: string }) {
  return (
    <div className="space-y-4" aria-live="polite" aria-label={label}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <LoaderCircle size={17} className="animate-spin text-buyme-primary" aria-hidden="true" />
        {label}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-white bg-white/80" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-white bg-white/80" />
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-5 py-12 text-center">
      <PackageSearch className="mx-auto text-slate-400" size={28} aria-hidden="true" />
      <h2 className="mt-3 font-heading text-base font-extrabold text-buyme-navy">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/95 p-5 text-red-950" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-bold">The live data could not be loaded.</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="mt-3 text-sm font-bold underline underline-offset-2">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Surface({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/90 bg-white/90 p-4 shadow-[0_8px_32px_rgba(31,36,48,0.06)] backdrop-blur-xl sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

export function formatLkr(value: number | string): string {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 2 }).format(amount)
    : "—";
}
