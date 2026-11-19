import Link from "next/link";
import React from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function FutureGateNotice({
  portal,
  description,
  loginHref,
}: {
  portal: string;
  description: string;
  loginHref: string;
}) {
  return (
    <main className="aurora-bg flex min-h-screen items-center justify-center px-4 py-10">
      <section className="relative z-10 w-full max-w-xl rounded-3xl border border-white/90 bg-white/95 p-7 text-center shadow-glass-elevated sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-buyme-primary">
          <LockKeyhole size={23} aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-buyme-primary">Implementation gate pending</p>
        <h1 className="mt-2 font-heading text-2xl font-extrabold text-buyme-navy">{portal}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{description}</p>
        <Link href={loginHref} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-buyme-primary px-4 text-sm font-bold text-white hover:bg-buyme-primary-deep">
          <ArrowLeft size={16} aria-hidden="true" /> Return to sign-in
        </Link>
      </section>
    </main>
  );
}
