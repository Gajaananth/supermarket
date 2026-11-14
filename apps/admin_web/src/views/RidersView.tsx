"use client";

import React, { useState } from "react";
import {
  Bike,
  Phone,
  Star,
  CheckCircle2,
  DollarSign,
  Shield,
  Lock,
  Clock,
  AlertTriangle,
  FileText,
  Check,
  X,
  Eye,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { DepositRecord } from "@/context/AdminContext";

interface RidersViewProps {
  riders: any[];
  deposits?: DepositRecord[];
  onToggleRiderStatus: (riderId: string) => void;
  onApproveDeposit?: (depositId: string) => void;
  onRejectDeposit?: (depositId: string, reason: string) => void;
}

export default function RidersView({
  riders,
  deposits = [],
  onToggleRiderStatus,
  onApproveDeposit,
  onRejectDeposit,
}: RidersViewProps) {
  const [activeTab, setActiveTab] = useState<"fleet" | "deposits">("fleet");
  const [previewSlip, setPreviewSlip] = useState<DepositRecord | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("Illegible bank receipt stamp");

  const pendingDeposits = deposits.filter((d) => d.status === "pending");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Delivery Rider Fleet & Operations
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Real-time status, vehicle fleet, COD cash meters, and cash deposit verification queue.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("fleet")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "fleet"
                ? "bg-white text-[#10243B] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rider Fleet ({riders.length})
          </button>
          <button
            onClick={() => setActiveTab("deposits")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "deposits"
                ? "bg-[#E4002B] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Deposit Queue</span>
            {pendingDeposits.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === "deposits"
                    ? "bg-white text-[#E4002B]"
                    : "bg-[#E4002B] text-white"
                }`}
              >
                {pendingDeposits.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Rider Fleet Cards */}
      {activeTab === "fleet" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riders.map((r) => {
            const isOnline = r.status !== "offline" && r.shiftStatus !== "offline";
            const cash = Number(r.cashInHand || 0);
            const cashAge = Number(r.cashAgeHours || 0);

            let lockReason: string | null = null;
            if (r.depositPending) {
              lockReason = "Locked: Deposit pending Store Admin verification";
            } else if (cash >= 10000) {
              lockReason = `Locked: Cash limit exceeded (LKR ${cash.toLocaleString()} >= 10k)`;
            } else if (cashAge >= 4 && cash > 0) {
              lockReason = `Locked: Cash held > 4 hours (${cashAge}h held)`;
            } else if (!isOnline) {
              lockReason = "Locked: Rider offline";
            }

            const isLocked = Boolean(lockReason);

            return (
              <div
                key={r.id}
                className={`rounded-3xl bg-white/85 backdrop-blur-xl border shadow-[0_8px_32px_rgba(16,36,59,0.04)] p-6 flex flex-col justify-between transition-all ${
                  isLocked
                    ? "border-amber-200/80 shadow-amber-500/5"
                    : "border-white/80 hover:-translate-y-1 hover:shadow-red-500/10"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#B80022] text-white font-heading font-black text-sm flex items-center justify-center shadow-md shadow-red-500/20">
                        {r.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-base text-[#10243B]">
                          {r.name}
                        </h3>
                        <span className="text-xs text-[#62748A] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {r.phone}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        r.status === "on_delivery" || r.status === "delivering"
                          ? "bg-blue-100 text-[#B80022]"
                          : isOnline
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {(r.status || "available").replace("_", " ")}
                    </span>
                  </div>

                  {/* Lock Status Alert */}
                  {isLocked && (
                    <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">{lockReason}</span>
                    </div>
                  )}

                  {/* Vehicle & Specs */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#62748A]">Stationed Hub</span>
                      <strong className="text-[#10243B]">{r.storeId || "BM-S01"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#62748A]">Vehicle</span>
                      <strong className="text-[#10243B]">{r.vehicleType || "Motorcycle"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#62748A]">License Plate</span>
                      <strong className="font-mono text-[#E4002B]">{r.vehiclePlate || r.vehicleNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#62748A]">Driver Rating</span>
                      <strong className="text-amber-500 flex items-center gap-1 font-heading">
                        <Star className="w-3 h-3 fill-amber-500" /> {r.rating} / 5.0
                      </strong>
                    </div>
                  </div>

                  {/* Cash in Hand Meter */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#10243B]">Cash in Hand (COD)</span>
                      <span className={`font-extrabold ${cash >= 10000 ? "text-[#E4002B]" : "text-emerald-700"}`}>
                        LKR {cash.toLocaleString()} / 10k
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cash >= 10000 ? "bg-red-600" : cash >= 7500 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (cash / 10000) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Holding: {cashAge}h</span>
                      {cash >= 10000 && <span className="text-[#E4002B] font-bold">Must Deposit Whole</span>}
                      {cashAge >= 4 && cash < 10000 && cash > 0 && <span className="text-amber-600 font-bold">4-Hr Rule Triggered</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onToggleRiderStatus(r.id)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      isOnline
                        ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {isOnline ? "Set Shift Offline" : "Set Shift Online"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Deposit Verification Queue */}
      {activeTab === "deposits" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>
                <strong>Deposit Verification Queue</strong>: Inspect bank deposit receipts and slips. Approving will automatically credit the deposit, deduct rider cash, and unlock their shift.
              </span>
            </span>
          </div>

          {deposits.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 text-xs">
              No deposit submissions recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((dep) => {
                const isPending = dep.status === "pending";
                const isApproved = dep.status === "approved";
                const isRejected = dep.status === "rejected";

                return (
                  <div
                    key={dep.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Slip Thumbnail */}
                      <div
                        onClick={() => setPreviewSlip(dep)}
                        className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center cursor-pointer hover:border-[#E4002B] transition-colors relative group"
                        title="Click to view full receipt slip"
                      >
                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-[#E4002B]" />
                        <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white px-1 rounded">
                          VIEW
                        </span>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#10243B] truncate">
                            {dep.riderName}
                          </span>
                          <span className="text-xs text-slate-500">({dep.riderId})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800"
                                : isRejected
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {dep.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Hub: <strong>{dep.storeName || dep.storeId}</strong></span>
                          <span>•</span>
                          <span>Ref: <strong className="font-mono text-slate-800">{dep.refNumber}</strong></span>
                          <span>•</span>
                          <span>
                            Submitted: {new Date(dep.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {isRejected && dep.rejectionReason && (
                          <p className="text-xs text-rose-600 font-semibold">
                            Rejection Reason: {dep.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">
                          Deposit Amount
                        </span>
                        <span className="text-lg font-black text-[#E4002B] font-heading">
                          LKR {Number(dep.amount).toLocaleString()}
                        </span>
                      </div>

                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onApproveDeposit && onApproveDeposit(dep.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => setRejectingDeposit(dep)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Preview Slip Modal */}
      {previewSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-white/80 shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setPreviewSlip(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#E4002B] uppercase tracking-wider">
                Deposit Verification Slip
              </span>
              <h3 className="text-lg font-extrabold text-[#10243B] font-heading mt-0.5">
                {previewSlip.refNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Submitted by {previewSlip.riderName} ({previewSlip.riderId})
              </p>
            </div>

            {/* Stamped Receipt Slip Simulation */}
            <div className="border border-slate-300 rounded-2xl p-5 bg-amber-50/30 space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-extrabold text-sm text-[#10243B]">BANK OF CEYLON — BATTICALOA</p>
                <p className="text-[10px] text-slate-500">Cash Deposit Slip • Counter 03</p>
              </div>
              <div className="flex justify-between">
                <span>Rider Name:</span>
                <strong className="text-right">{previewSlip.riderName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Account:</span>
                <span>BuyMe Retail PVT LTD (0029-4821)</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <strong className="text-[#E4002B]">{previewSlip.refNumber}</strong>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200">
                <span>Amount:</span>
                <span className="text-[#E4002B]">LKR {Number(previewSlip.amount).toLocaleString()}</span>
              </div>
              <div className="pt-2 text-center">
                <span className="inline-block border-2 border-emerald-600 text-emerald-700 font-extrabold text-[11px] px-3 py-1 rounded-lg rotate-[-3deg] uppercase">
                  BANK STAMPED & VERIFIED
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewSlip(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-white/80 shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setRejectingDeposit(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Reject Deposit Submission
              </span>
              <h3 className="text-lg font-extrabold text-[#10243B] font-heading mt-0.5">
                Specify Reason for Rejection
              </h3>
              <p className="text-xs text-slate-500">
                Rider {rejectingDeposit.riderName} will remain locked until a valid slip is submitted.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">Select Rejection Reason:</label>
              {[
                "Illegible bank receipt stamp",
                "Deposit amount mismatch with slip",
                "Invalid reference number",
                "Duplicate slip already processed",
              ].map((reason) => (
                <div
                  key={reason}
                  onClick={() => setRejectionReason(reason)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    rejectionReason === reason
                      ? "bg-rose-50 border-rose-300 text-rose-900 font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{reason}</span>
                  {rejectionReason === reason && <Check className="w-4 h-4 text-rose-600" />}
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setRejectingDeposit(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onRejectDeposit) onRejectDeposit(rejectingDeposit.id, rejectionReason);
                  setRejectingDeposit(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
