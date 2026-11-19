"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bike, LogOut, MapPin, ShieldCheck, Store, UserRound } from "lucide-react";

interface RiderSession {
  user: {
    id: string;
    role: "RIDER";
    fullName: string;
    email: string | null;
    phone: string | null;
    store: { id: string; code: string; name: string } | null;
    riderProfile: {
      id: string;
      kycStatus: string;
      riderType: string;
      assignedStoreId: string | null;
      bikeNumber: string | null;
      rejectionReason: string | null;
    } | null;
  };
}

export default function RiderPortalPage() {
  const [session, setSession] = useState<RiderSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Sign-in required");
        const data = await response.json() as RiderSession;
        if (data.user.role !== "RIDER") throw new Error("Rider account required");
        setSession(data);
      })
      .catch(() => {
        window.location.replace("/rider/login");
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/rider/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-buyme-canvas text-sm font-bold text-slate-600">
        Loading rider workspace…
      </main>
    );
  }

  if (!session) return null;

  const profile = session.user.riderProfile;
  const approved = profile?.kycStatus === "APPROVED";

  return (
    <main className="min-h-screen bg-buyme-canvas px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-white bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-buyme-primary text-white">
              <Bike size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-buyme-primary">Rider workspace</p>
              <h1 className="mt-1 font-heading text-xl font-extrabold text-buyme-navy">
                {session.user.fullName}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:border-buyme-primary hover:text-buyme-primary"
          >
            <LogOut size={16} aria-hidden="true" /> Logout
          </button>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-white bg-white p-5 shadow-card">
            <UserRound className="text-buyme-primary" size={20} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Account</p>
            <p className="mt-2 font-heading text-lg font-extrabold text-buyme-navy">{session.user.fullName}</p>
            <p className="mt-1 text-sm text-slate-600">{session.user.email ?? session.user.phone}</p>
          </article>

          <article className="rounded-3xl border border-white bg-white p-5 shadow-card">
            <Store className="text-buyme-primary" size={20} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Assigned store</p>
            <p className="mt-2 font-heading text-lg font-extrabold text-buyme-navy">
              {session.user.store?.name ?? "BM-S01"}
            </p>
            <p className="mt-1 text-sm text-slate-600">{session.user.store?.code ?? "BuyMe Batticaloa Town"}</p>
          </article>

          <article className="rounded-3xl border border-white bg-white p-5 shadow-card">
            <ShieldCheck className={approved ? "text-emerald-600" : "text-amber-600"} size={20} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">KYC status</p>
            <p className="mt-2 font-heading text-lg font-extrabold text-buyme-navy">{profile?.kycStatus ?? "REGISTERED"}</p>
            <p className="mt-1 text-sm text-slate-600">
              {profile?.bikeNumber ? `Bike ${profile.bikeNumber}` : "No bike number assigned"}
            </p>
          </article>
        </div>

        <section className="mt-5 rounded-3xl border border-white bg-white p-6 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
              <MapPin size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-extrabold text-buyme-navy">Today&apos;s rider workspace</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {approved
                  ? "Your account is approved for BM-S01. Delivery assignment and live navigation features are ready for the next implementation phase."
                  : "Complete rider KYC verification before accepting delivery assignments."}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500">Shift</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-buyme-navy">Available</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500">Deliveries</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-buyme-navy">0 assigned</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500">Cash in hand</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-buyme-navy">LKR 0</p>
            </div>
          </div>
        </section>

        <Link href="/" className="mt-5 inline-flex text-sm font-bold text-slate-600 hover:text-buyme-primary">
          ← Back to BuyMe storefront
        </Link>
      </section>
    </main>
  );
}
