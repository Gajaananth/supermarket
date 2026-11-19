"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { BadgeCheck, ExternalLink, FileText, ShieldAlert } from "lucide-react";
import { EmptyState, ErrorState, formatLkr, LoadingState, PageHeader, Surface } from "@/components/admin/States";
import { useAdminData } from "@/context/AdminContext";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { DepositVerificationItem } from "@/lib/api/models";

type ReviewAction = "REJECT" | "VARIANCE";

export default function DepositsPage() {
  const { sessionUser, sessionLoading } = useAdminData();
  const [deposits, setDeposits] = useState<DepositVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState("");
  const [reviewingId, setReviewingId] = useState("");
  const [reviewAction, setReviewAction] = useState<ReviewAction>("REJECT");
  const [reason, setReason] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [slipUrls, setSlipUrls] = useState<Record<string, string>>({});

  const loadDeposits = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await api.GET("/api/v1/cash-control/deposits/verification-queue", {
        params: { query: { limit: 50 } },
      });
      setDeposits(unwrapApiResponse<DepositVerificationItem[]>(result));
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDeposits();
  }, [loadDeposits]);

  const approve = async (deposit: DepositVerificationItem) => {
    setSavingId(deposit.id);
    setActionError("");
    setNotice("");
    try {
      const result = await api.POST("/api/v1/cash-control/deposits/{id}/verify", {
        params: { path: { id: deposit.id } },
        body: { action: "APPROVE" },
      });
      unwrapApiResponse<unknown>(result);
      setNotice(`Deposit ${deposit.depositNumber} approved.`);
      await loadDeposits();
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSavingId("");
    }
  };

  const openReview = (depositId: string, action: ReviewAction) => {
    setReviewingId(depositId);
    setReviewAction(action);
    setReason("");
    setReceivedAmount("");
    setActionError("");
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>, deposit: DepositVerificationItem) => {
    event.preventDefault();
    if (reason.trim().length < 3) {
      setActionError("Enter a reason with at least 3 characters.");
      return;
    }
    const amount = Number(receivedAmount);
    if (reviewAction === "VARIANCE" && (!Number.isFinite(amount) || amount < 0)) {
      setActionError("Enter a valid received amount.");
      return;
    }

    setSavingId(deposit.id);
    setActionError("");
    setNotice("");
    try {
      const result = await api.POST("/api/v1/cash-control/deposits/{id}/verify", {
        params: { path: { id: deposit.id } },
        body: reviewAction === "REJECT"
          ? { action: "REJECT", rejectionReason: reason.trim() }
          : { action: "VARIANCE", receivedAmount: amount, varianceReason: reason.trim() },
      });
      unwrapApiResponse<unknown>(result);
      setNotice(reviewAction === "REJECT"
        ? `Deposit ${deposit.depositNumber} rejected with a reason.`
        : `Variance case opened for ${deposit.depositNumber}.`);
      setReviewingId("");
      await loadDeposits();
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSavingId("");
    }
  };

  const loadSlipUrl = async (deposit: DepositVerificationItem) => {
    setActionError("");
    try {
      const result = await api.GET("/api/v1/cash-control/deposits/{id}/slip-url", {
        params: { path: { id: deposit.id } },
      });
      const signed = unwrapApiResponse<{ depositId: string; url: string; expiresInSeconds: number }>(result);
      let signedUrl: URL;
      try {
        signedUrl = new URL(signed.url);
      } catch {
        throw new Error("The API returned an invalid private slip URL.");
      }
      if (
        signed.depositId !== deposit.id ||
        (signedUrl.protocol !== "https:" && signedUrl.protocol !== "http:")
      ) {
        throw new Error("The API returned an invalid private slip URL.");
      }
      setSlipUrls((current) => ({ ...current, [deposit.id]: signed.url }));
    } catch (error) {
      setActionError(describeApiError(error));
    }
  };

  if (sessionLoading || loading) return <LoadingState label="Loading deposit verification queue…" />;
  if (sessionUser?.role !== "STORE_ADMIN" || !sessionUser.store) {
    return <ErrorState message="An assigned Store Admin account is required to verify deposits." />;
  }

  return (
    <>
      <PageHeader
        eyebrow={sessionUser.store.code}
        title="Deposit verification"
        description="Review private rider deposit slips for your store, approve exact deposits, reject with a reason, or open a variance case."
      />
      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}
      {loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadDeposits()} />
      ) : deposits.length === 0 ? (
        <EmptyState title="Queue is clear" description="Pending deposits and open variance cases for this store will appear here." />
      ) : (
        <div className="space-y-4">
          {deposits.map((deposit) => {
            const busy = savingId === deposit.id;
            const isReviewing = reviewingId === deposit.id;
            return (
              <Surface key={deposit.id}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading text-base font-extrabold text-buyme-navy">{deposit.depositNumber}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        deposit.status === "VARIANCE" ? "bg-amber-100 text-amber-950" : "bg-blue-50 text-blue-800"
                      }`}>{deposit.status.replaceAll("_", " ")}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-800">{deposit.rider.user.fullName}</p>
                    <p className="text-xs text-slate-500">{deposit.rider.user.phone ?? deposit.rider.user.email ?? "No contact details"}</p>
                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                      <div><dt className="text-slate-500">Amount submitted</dt><dd className="mt-0.5 font-bold text-buyme-navy">{formatLkr(deposit.amount)}</dd></div>
                      <div><dt className="text-slate-500">Bank reference</dt><dd className="mt-0.5 break-all font-mono font-semibold text-slate-700">{deposit.bankRefNumber}</dd></div>
                      <div><dt className="text-slate-500">Submitted</dt><dd className="mt-0.5 font-semibold text-slate-700">{new Date(deposit.submittedAt).toLocaleString()}</dd></div>
                      {deposit.status === "VARIANCE" && (
                        <div><dt className="text-slate-500">Variance</dt><dd className="mt-0.5 font-bold text-amber-900">{formatLkr(deposit.varianceAmount ?? 0)} · {deposit.varianceReason ?? "Reason unavailable"}</dd></div>
                      )}
                    </dl>
                    {deposit.rejectionReason && <p className="mt-3 text-xs text-red-800">Previous rejection: {deposit.rejectionReason}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {slipUrls[deposit.id] ? (
                        <a
                          href={slipUrls[deposit.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-buyme-primary"
                        >
                          <ExternalLink size={14} aria-hidden="true" /> Open private slip
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void loadSlipUrl(deposit)}
                          className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-rose-200 hover:text-buyme-primary"
                        >
                          <FileText size={14} aria-hidden="true" /> Generate slip link
                        </button>
                      )}
                      {deposit.status === "VARIANCE" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900">
                          <ShieldAlert size={14} aria-hidden="true" /> Super Admin resolves open variances
                        </span>
                      )}
                    </div>
                  </div>

                  {deposit.status === "PENDING" && (
                    <div className="flex w-full shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 xl:w-64 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void approve(deposit)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-buyme-primary px-3 text-xs font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60"
                      >
                        <BadgeCheck size={15} aria-hidden="true" /> Approve exact amount
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openReview(deposit.id, "REJECT")}
                          className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 hover:border-red-200 hover:text-red-800 disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openReview(deposit.id, "VARIANCE")}
                          className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 hover:border-amber-300 hover:text-amber-900 disabled:opacity-60"
                        >
                          Record variance
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isReviewing && (
                  <form onSubmit={(event) => void submitReview(event, deposit)} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[minmax(160px,0.5fr)_minmax(220px,1fr)_auto] sm:items-end">
                    <div>
                      <label htmlFor={`review-action-${deposit.id}`} className="mb-1.5 block text-xs font-bold text-slate-700">Review action</label>
                      <select
                        id={`review-action-${deposit.id}`}
                        value={reviewAction}
                        onChange={(event) => setReviewAction(event.target.value as ReviewAction)}
                        className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                      >
                        <option value="REJECT">Reject deposit</option>
                        <option value="VARIANCE">Open variance case</option>
                      </select>
                    </div>
                    {reviewAction === "VARIANCE" && (
                      <div>
                        <label htmlFor={`received-amount-${deposit.id}`} className="mb-1.5 block text-xs font-bold text-slate-700">Amount received</label>
                        <input
                          id={`received-amount-${deposit.id}`}
                          type="number"
                          min="0"
                          max="99999999.99"
                          step="0.01"
                          required
                          value={receivedAmount}
                          onChange={(event) => setReceivedAmount(event.target.value)}
                          className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                        />
                      </div>
                    )}
                    <div className={reviewAction === "REJECT" ? "sm:col-span-2" : ""}>
                      <label htmlFor={`review-reason-${deposit.id}`} className="mb-1.5 block text-xs font-bold text-slate-700">
                        {reviewAction === "REJECT" ? "Rejection reason" : "Variance reason"}
                      </label>
                      <input
                        id={`review-reason-${deposit.id}`}
                        type="text"
                        minLength={3}
                        maxLength={500}
                        required
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                    <div className="flex gap-2 sm:col-span-3 sm:justify-end">
                      <button type="button" onClick={() => setReviewingId("")} className="min-h-10 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" disabled={busy} className="min-h-10 rounded-lg bg-buyme-primary px-4 text-xs font-bold text-white hover:bg-buyme-primary-deep disabled:opacity-60">
                        {busy ? "Saving…" : "Submit review"}
                      </button>
                    </div>
                  </form>
                )}
              </Surface>
            );
          })}
        </div>
      )}
    </>
  );
}
