"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Bike, FileImage, ShieldCheck, UserRound, X } from "lucide-react";
import { api, describeApiError, unwrapApiResponse } from "@/lib/api/client";
import type { RiderReviewDetails, RiderReviewQueue, Store, StoreList } from "@/lib/api/models";
import { EmptyState, ErrorState, LoadingState, PageHeader, Surface } from "@/components/admin/States";

type KycDocument = "driving-licence" | "vehicle-licence";
type SignedUrl = { url: string; expiresInSeconds: number };

export default function RiderKycPage() {
  const [queue, setQueue] = useState<RiderReviewQueue | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selected, setSelected] = useState<RiderReviewDetails | null>(null);
  const [page, setPage] = useState(1);
  const [documentUrls, setDocumentUrls] = useState<Partial<Record<KycDocument, string>>>({});
  const [storeId, setStoreId] = useState("");
  const [riderType, setRiderType] = useState<"EMPLOYEE" | "FREELANCE">("EMPLOYEE");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const loadQueue = async (targetPage = page) => {
    setLoading(true);
    setLoadError("");
    try {
      const [queueResult, storeResult] = await Promise.all([
        api.GET("/api/v1/riders/review-queue", { params: { query: { page: targetPage, pageSize: 25 } } }),
        api.GET("/api/v1/stores/admin"),
      ]);
      setQueue(unwrapApiResponse<RiderReviewQueue>(queueResult));
      setStores(unwrapApiResponse<StoreList>(storeResult).stores);
    } catch (error) {
      setLoadError(describeApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQueue(page);
  }, [page]);

  const openReview = async (riderId: string) => {
    setSelected(null);
    setDocumentUrls({});
    setActionError("");
    setDetailLoading(true);
    try {
      const result = await api.GET("/api/v1/riders/review-queue/{riderId}", {
        params: { path: { riderId } },
      });
      setSelected(unwrapApiResponse<RiderReviewDetails>(result));
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const openDocument = async (documentType: KycDocument) => {
    if (!selected) return;
    setActionError("");
    try {
      const result = await api.GET("/api/v1/riders/{riderId}/kyc/{documentType}/url", {
        params: { path: { riderId: selected.id, documentType } },
      });
      const signed = unwrapApiResponse<SignedUrl>(result);
      setDocumentUrls((current) => ({ ...current, [documentType]: signed.url }));
    } catch (error) {
      setActionError(describeApiError(error));
    }
  };

  const review = async (event: FormEvent<HTMLFormElement>, action: "approve" | "reject") => {
    event.preventDefault();
    if (!selected) return;
    if (action === "approve" && !storeId) {
      setActionError("Select an active store before approving rider KYC.");
      return;
    }
    if (action === "reject" && !reason.trim()) {
      setActionError("A rejection reason is required.");
      return;
    }
    setSaving(true);
    setActionError("");
    setNotice("");
    try {
      const result = action === "approve"
        ? await api.POST("/api/v1/riders/{riderId}/approve", {
            params: { path: { riderId: selected.id } },
            body: { storeId, riderType },
          })
        : await api.POST("/api/v1/riders/{riderId}/reject", {
            params: { path: { riderId: selected.id } },
            body: { reason: reason.trim() },
          });
      unwrapApiResponse<unknown>(result);
      setNotice(action === "approve" ? "Rider approved and assigned to the selected store." : "KYC rejected with the reason recorded.");
      setSelected(null);
      setDocumentUrls({});
      setReason("");
      await loadQueue(page);
    } catch (error) {
      setActionError(describeApiError(error));
    } finally {
      setSaving(false);
    }
  };

  const pageCount = queue ? Math.max(1, Math.ceil(queue.total / queue.pageSize)) : 1;

  return (
    <>
      <PageHeader
        eyebrow="Rider onboarding"
        title="Rider KYC review"
        description="Review submitted rider documents, assign an active store and rider type, or reject with a clear resubmission reason."
        action={
          <div className="rounded-xl border border-white bg-white/90 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-500">Awaiting review</p>
            <p className="font-heading text-lg font-extrabold text-buyme-navy">{loading ? "—" : queue?.total ?? 0}</p>
          </div>
        }
      />

      {notice && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>}
      {actionError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900" role="alert">{actionError}</p>}

      {loading ? (
        <LoadingState label="Loading the rider review queue…" />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={() => void loadQueue(page)} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.3fr)]">
          <Surface className="p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div>
                <h2 className="font-heading text-sm font-extrabold text-buyme-navy">Submitted applications</h2>
                <p className="mt-1 text-xs text-slate-500">Oldest submissions appear first.</p>
              </div>
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-buyme-primary">{queue?.total ?? 0}</span>
            </div>
            {!queue?.items.length ? (
              <div className="p-4"><EmptyState title="Queue is clear" description="There are no submitted rider applications awaiting review." /></div>
            ) : (
              <>
                <div className="divide-y divide-slate-100">
                  {queue.items.map((rider) => (
                    <button
                      type="button"
                      key={rider.id}
                      onClick={() => void openReview(rider.id)}
                      className={`w-full px-4 py-4 text-left transition hover:bg-slate-50 ${selected?.id === rider.id ? "bg-rose-50/70" : ""}`}
                    >
                      <span className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <UserRound size={18} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-buyme-navy">{rider.user.fullName}</span>
                          <span className="mt-1 block truncate text-xs text-slate-500">{rider.user.phone ?? rider.user.email ?? "No contact details"}</span>
                          <span className="mt-1 block font-mono text-[11px] text-slate-400">{rider.bikeNumber ?? "Bike number not submitted"}</span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold disabled:opacity-40">Previous</button>
                  <span className="text-xs text-slate-500">Page {page} of {pageCount}</span>
                  <button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => value + 1)} className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold disabled:opacity-40">Next</button>
                </div>
              </>
            )}
          </Surface>

          <Surface className="min-h-[460px]">
            {detailLoading ? (
              <LoadingState label="Loading private rider review details…" />
            ) : !selected ? (
              <EmptyState title="Select an application" description="Choose a rider from the queue to review the submitted details and documents." />
            ) : (
              <>
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
                      <Bike size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-buyme-primary">KYC submitted</p>
                      <h2 className="mt-1 font-heading text-lg font-extrabold text-buyme-navy">{selected.user.fullName}</h2>
                      <p className="mt-1 text-xs text-slate-500">{selected.user.phone ?? selected.user.email ?? "No contact details"}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} aria-label="Close rider review" className="self-end rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:self-auto">
                    <X size={17} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold text-slate-500">Bike registration</p>
                    <p className="mt-1 font-mono text-sm font-bold text-buyme-navy">{selected.bikeNumber ?? "Not provided"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold text-slate-500">Submitted</p>
                    <p className="mt-1 text-sm font-bold text-buyme-navy">{new Date(selected.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="font-heading text-sm font-extrabold text-buyme-navy">Private documents</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Signed links are generated only when requested and expire according to API storage settings.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {([
                      ["driving-licence", "Driving licence", selected.documents.drivingLicenceAvailable],
                      ["vehicle-licence", "Vehicle licence", selected.documents.vehicleLicenceAvailable],
                    ] as const).map(([type, label, available]) => (
                      <div key={type} className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="flex items-center gap-2 text-sm font-bold text-buyme-navy">
                          <FileImage size={16} className="text-buyme-primary" aria-hidden="true" /> {label}
                        </p>
                        {available ? (
                          documentUrls[type] ? (
                            <a href={documentUrls[type]} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-bold text-buyme-primary underline underline-offset-2">
                              Open signed document
                            </a>
                          ) : (
                            <button type="button" onClick={() => void openDocument(type)} className="mt-2 text-xs font-bold text-buyme-primary underline underline-offset-2">
                              Generate secure document link
                            </button>
                          )
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">Document not available.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="font-heading text-sm font-extrabold text-buyme-navy">Review decision</h3>
                  <form onSubmit={(event) => void review(event, "approve")} className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                    <div>
                      <label htmlFor="rider-store" className="mb-1.5 block text-xs font-bold text-slate-700">Assign active store</label>
                      <select id="rider-store" required value={storeId} onChange={(event) => setStoreId(event.target.value)} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100">
                        <option value="">Select store</option>
                        {stores.filter((store) => store.isActive).map((store) => <option key={store.id} value={store.id}>{store.code} · {store.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rider-type" className="mb-1.5 block text-xs font-bold text-slate-700">Rider type</label>
                      <select id="rider-type" value={riderType} onChange={(event) => setRiderType(event.target.value as "EMPLOYEE" | "FREELANCE")} className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100">
                        <option value="EMPLOYEE">Employee</option>
                        <option value="FREELANCE">Freelance</option>
                      </select>
                    </div>
                    <button type="submit" disabled={saving || !stores.some((store) => store.isActive)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-xs font-extrabold text-white hover:bg-emerald-800 disabled:opacity-50">
                      <ShieldCheck size={15} aria-hidden="true" /> Approve
                    </button>
                  </form>

                  <form onSubmit={(event) => void review(event, "reject")} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <label htmlFor="reject-reason" className="mb-1.5 block text-xs font-bold text-slate-700">Rejection reason</label>
                      <input id="reject-reason" required minLength={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain what needs to be corrected" className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-buyme-primary focus:ring-2 focus:ring-rose-100" />
                    </div>
                    <button type="submit" disabled={saving} className="min-h-10 rounded-lg border border-red-200 bg-white px-4 text-xs font-extrabold text-red-800 hover:bg-red-50 disabled:opacity-50">Reject for resubmission</button>
                  </form>
                </div>
              </>
            )}
          </Surface>
        </div>
      )}
    </>
  );
}
