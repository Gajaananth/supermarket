"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, KeyRound, Phone, ShieldCheck } from "lucide-react";

type Portal = "customer" | "rider";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function messageFromBody(value: unknown): string {
  if (isRecord(value) && typeof value.message === "string") return value.message;
  return "Sign-in could not be completed.";
}

function OtpForm({ portal }: { portal: Portal }) {
  const router = useRouter();
  const params = useSearchParams();
  const isCustomer = portal === "customer";
  const [destination, setDestination] = useState("");
  const [code, setCode] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const path = `/api/auth/${portal}/${requested ? "otp-verify" : "otp-request"}`;
    const payload = isCustomer
      ? requested ? { phone: destination, code } : { phone: destination }
      : requested ? { destination, code } : { destination };
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        setError(messageFromBody(body));
        return;
      }
      if (!requested) {
        setDemoCode(isRecord(body) && typeof body.demoCode === "string" && /^\d{6}$/.test(body.demoCode) ? body.demoCode : "");
        setRequested(true);
        return;
      }
      router.replace(isCustomer ? "/shop/account" : "/rider");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The sign-in request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const phaseNotice = params.get("phase") === "not-started";
  const portalName = isCustomer ? "Customer" : "Rider";

  return (
    <main className="aurora-bg relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <section className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(31,36,48,0.12)] backdrop-blur-2xl sm:p-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-buyme-primary">
          <ArrowLeft size={16} aria-hidden="true" /> BuyMe home
        </Link>
        <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-buyme-primary">
          {requested ? <KeyRound size={22} aria-hidden="true" /> : <Phone size={22} aria-hidden="true" />}
        </div>
        <p className="mt-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-buyme-primary">
          <ShieldCheck size={15} aria-hidden="true" /> {portalName} sign in
        </p>
        <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-buyme-navy">
          {requested ? "Enter your verification code" : `Continue as ${portalName.toLowerCase()}`}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {requested
            ? demoCode
              ? "Use the staging demo code shown below."
              : `Enter the six-digit code sent to ${destination}.`
            : isCustomer
              ? "We will send a one-time code to your registered Sri Lankan mobile number."
              : "Use the phone number or email address registered to your rider account."}
        </p>
        {phaseNotice && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
            This portal section is scheduled for a later implementation gate.
          </p>
        )}
        <form onSubmit={submit} className="mt-7 space-y-5">
          {!requested ? (
            <div>
              <label htmlFor="otp-destination" className="mb-2 block text-sm font-bold text-slate-800">
                {isCustomer ? "Mobile number" : "Mobile number or email"}
              </label>
              <input
                id="otp-destination"
                type={isCustomer ? "tel" : "text"}
                autoComplete={isCustomer ? "tel" : "username"}
                inputMode={isCustomer ? "tel" : "text"}
                placeholder={isCustomer ? "+94772220001" : "+94771110001 or rider@example.com"}
                maxLength={100}
                required
                value={destination}
                onChange={(event) => setDestination(event.target.value.trim())}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-buyme-navy outline-none transition focus:border-buyme-primary focus:ring-4 focus:ring-rose-100"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="otp-code" className="mb-2 block text-sm font-bold text-slate-800">
                Six-digit code
              </label>
              <input
                id="otp-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm tracking-[0.35em] text-buyme-navy outline-none transition focus:border-buyme-primary focus:ring-4 focus:ring-rose-100"
              />
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
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-buyme-primary px-4 text-sm font-extrabold text-white transition hover:bg-buyme-primary-deep focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Please wait…" : requested ? "Verify and continue" : "Send sign-in code"}
          </button>
        </form>
        {requested && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setRequested(false);
                setCode("");
                setDemoCode("");
                setError("");
              }}
              className="text-sm font-semibold text-slate-600 hover:text-buyme-primary"
            >
              Change {isCustomer ? "number" : "contact"}
            </button>
            {demoCode && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950" role="status">
                Staging demo code: <span className="font-mono">{demoCode}</span>
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default function OtpLoginForm({ portal }: { portal: Portal }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-buyme-canvas" aria-label="Loading sign-in" />}>
      <OtpForm portal={portal} />
    </Suspense>
  );
}
