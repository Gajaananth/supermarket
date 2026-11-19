"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

type Portal = "super-admin" | "store-admin";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function messageFromBody(value: unknown): string {
  if (isRecord(value) && typeof value.message === "string") return value.message;
  return "Sign-in could not be completed.";
}

function LoginForm({ portal }: { portal: Portal }) {
  const router = useRouter();
  const params = useSearchParams();
  const isSuperAdmin = portal === "super-admin";
  const requestedRedirect = params.get("redirect");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const endpoint = requiresTwoFactor
        ? "/api/auth/admin/verify-2fa"
        : isSuperAdmin
          ? "/api/auth/admin/login"
          : "/api/auth/store-admin/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          requiresTwoFactor ? { email: twoFactorEmail, code } : { email, password },
        ),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setError(messageFromBody(body));
        return;
      }

      if (
        !requiresTwoFactor &&
        isRecord(body) &&
        body.requires2fa === true &&
        typeof body.email === "string"
      ) {
        setTwoFactorEmail(body.email);
        setDemoCode(typeof body.demoCode === "string" && /^\d{6}$/.test(body.demoCode) ? body.demoCode : "");
        setRequiresTwoFactor(true);
        return;
      }

      const allowedRedirects = isSuperAdmin
        ? ["/admin/overview", "/admin/inventory", "/admin/transfers", "/admin/stores", "/admin/riders", "/admin/reports"]
        : ["/admin/orders", "/admin/store-stock", "/admin/transfers", "/admin/deposits"];
      const fallback = isSuperAdmin ? "/admin/overview" : "/admin/orders";
      const destination = requestedRedirect && allowedRedirects.includes(requestedRedirect)
        ? requestedRedirect
        : fallback;
      router.replace(destination);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The sign-in request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const phaseNotice = params.get("phase") === "not-started";
  const logoutNotice = params.get("error") === "logout";
  const portalLabel = isSuperAdmin ? "Super Admin portal" : "Store Admin portal";

  return (
    <main className="aurora-bg relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_24px_80px_rgba(31,36,48,0.12)] backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden min-h-[580px] flex-col justify-between bg-gradient-to-br from-buyme-primary via-[#d00029] to-buyme-primary-deep p-10 text-white lg:flex">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 font-heading text-2xl font-extrabold">B</span>
            <span className="font-heading text-2xl font-extrabold">BuyMe</span>
          </div>
          <div className="max-w-md">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]">
              <ShieldCheck size={15} aria-hidden="true" />
              {portalLabel}
            </p>
            <h1 className="font-heading text-4xl font-extrabold leading-tight">
              {isSuperAdmin ? "Run every store with clarity." : "Keep your store moving."}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/85">
              {isSuperAdmin
                ? "Secure access to platform operations, store settings, rider verification, and reporting."
                : "Secure access to your store's orders, stock, transfers, and deposits."}
            </p>
          </div>
          <p className="text-xs font-medium text-white/75">Batticaloa District · Sri Lanka</p>
        </section>

        <section className="flex min-h-[580px] flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-8 lg:hidden">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-buyme-primary to-buyme-primary-deep font-heading text-2xl font-extrabold text-white">
              B
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-buyme-primary">BuyMe · {portalLabel}</p>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-buyme-primary">
            {requiresTwoFactor ? "Additional verification" : portalLabel}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-buyme-navy">
            {requiresTwoFactor ? "Verify your sign-in" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {requiresTwoFactor
              ? demoCode
                ? "Use the staging demo code shown below."
                : `Enter the six-digit code sent to ${twoFactorEmail}.`
              : "Sign in with your work email and password."}
          </p>

          {phaseNotice && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
              This portal section is scheduled for a later implementation gate.
            </p>
          )}
          {logoutNotice && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
              Your browser session was cleared, but the server could not confirm revocation. Sign in again or contact an administrator.
            </p>
          )}

          <form onSubmit={submit} className="mt-7 space-y-5">
            {!requiresTwoFactor ? (
              <>
                <div>
                  <label htmlFor="admin-email" className="mb-2 block text-sm font-bold text-slate-800">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="username"
                      required
                      maxLength={255}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-buyme-navy outline-none transition focus:border-buyme-primary focus:ring-4 focus:ring-rose-100"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-slate-800">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                    <input
                      id="admin-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-buyme-navy outline-none transition focus:border-buyme-primary focus:ring-4 focus:ring-rose-100"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="admin-code" className="mb-2 block text-sm font-bold text-slate-800">
                  Six-digit code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                  <input
                    id="admin-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm tracking-[0.35em] text-buyme-navy outline-none transition focus:border-buyme-primary focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-900" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-buyme-primary px-4 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(228,0,43,0.2)] transition hover:bg-buyme-primary-deep focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? "Verifying…" : requiresTwoFactor ? "Verify and continue" : "Sign in securely"}
            </button>
          </form>

          {requiresTwoFactor && (
            <button
              type="button"
              onClick={() => {
                setRequiresTwoFactor(false);
                setCode("");
                setDemoCode("");
                setError("");
              }}
              className="mt-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-slate-600 hover:text-buyme-primary"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Return to password sign-in
            </button>
          )}
          {requiresTwoFactor && demoCode && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950" role="status">
              Staging demo code: <span className="font-mono">{demoCode}</span>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default function OperationsLoginForm({ portal }: { portal: Portal }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-buyme-canvas" aria-label="Loading sign-in" />}>
      <LoginForm portal={portal} />
    </Suspense>
  );
}
