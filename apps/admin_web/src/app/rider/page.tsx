"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ridersData, ordersData } from "@/lib/mockData";
import {
  Bike,
  ShieldAlert,
  LogOut,
  CheckCircle,
  Phone,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  Lock,
  CheckCircle2,
  Package,
  X,
  FastForward,
} from "lucide-react";

export default function RiderPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [activeRider, setActiveRider] = useState<any>(null);
  const [cashInHand, setCashInHand] = useState<number>(7500);
  const [cashAgeHours, setCashAgeHours] = useState<number>(1);
  const [depositPending, setDepositPending] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [orders, setOrders] = useState<any[]>([]);

  // Deposit modal state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositRef, setDepositRef] = useState<string>("BOC-DEP-884920");
  const [depositSlipUrl, setDepositSlipUrl] = useState<string>("/images/sample-deposit-slip.png");
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  const threshold = 10000;

  // Rules:
  const isOverThreshold = cashInHand >= threshold;
  const isExpiredCash = cashAgeHours >= 4 && cashInHand > 0;
  const isLocked = isOverThreshold || isExpiredCash || depositPending || !isOnline;

  const handleResetData = () => {
    try {
      localStorage.removeItem("buyme_orders");
      localStorage.removeItem("buyme_riders");
      localStorage.removeItem("buyme_deposits");
      localStorage.removeItem("buyme_session");
    } catch (e) {}
    window.location.reload();
  };

  // Load session and synchronize rider and orders
  useEffect(() => {
    try {
      const stored = localStorage.getItem("buyme_session");
      if (!stored) {
        router.push("/login?redirect=/rider");
        return;
      }
      const parsed = JSON.parse(stored);
      if (parsed.role !== "rider" && parsed.role !== "main_admin") {
        router.push("/unauthorized?required=rider");
        return;
      }
      setSession(parsed);

      // Load riders from localStorage or default
      const storedRiders = localStorage.getItem("buyme_riders");
      const riderList = storedRiders ? JSON.parse(storedRiders) : ridersData;
      const found =
        riderList.find((r: any) => r.name.toLowerCase().includes(parsed.name.split(" ")[0].toLowerCase())) ||
        riderList[0];

      setActiveRider(found);
      setCashInHand(Number(found.cashInHand !== undefined ? found.cashInHand : 7500));
      setCashAgeHours(Number(found.cashAgeHours || 1));
      setDepositPending(Boolean(found.depositPending));
      setIsOnline(found.status !== "offline" && found.shiftStatus !== "offline");

      // Load orders
      const storedOrders = localStorage.getItem("buyme_orders");
      const orderList = storedOrders ? JSON.parse(storedOrders) : ordersData;
      setOrders(orderList);
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  // Sync rider state changes to localStorage
  const syncRiderState = (newCash: number, newAge: number, newPending: boolean, onlineStatus = isOnline) => {
    setCashInHand(newCash);
    setCashAgeHours(newAge);
    setDepositPending(newPending);
    if (!activeRider) return;

    try {
      const storedRiders = localStorage.getItem("buyme_riders");
      const riderList = storedRiders ? JSON.parse(storedRiders) : ridersData;
      const updatedList = riderList.map((r: any) =>
        r.id === activeRider.id
          ? {
              ...r,
              cashInHand: newCash,
              cashAgeHours: newAge,
              depositPending: newPending,
              status: onlineStatus ? (r.status === "offline" ? "available" : r.status) : "offline",
              shiftStatus: onlineStatus ? "active" : "offline",
            }
          : r
      );
      localStorage.setItem("buyme_riders", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("buyme_riders_updated"));
    } catch (e) {}
  };

  // Sync orders update
  const updateOrderInStorage = (updatedOrders: any[]) => {
    setOrders(updatedOrders);
    try {
      localStorage.setItem("buyme_orders", JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event("buyme_orders_updated"));
    } catch (e) {}
  };

  const handleSignOut = () => {
    localStorage.removeItem("buyme_session");
    router.push("/login");
  };

  // Order workflow actions
  const handleAcceptOrder = (orderId: string) => {
    if (isLocked) return;
    const updated = orders.map((o) =>
      o.id === orderId || o.orderNumber === orderId
        ? {
            ...o,
            orderStatus: "preparing",
            status: "preparing",
            riderId: activeRider.id,
            riderName: activeRider.name,
          }
        : o
    );
    updateOrderInStorage(updated);
  };

  const handlePickupOrder = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId || o.orderNumber === orderId
        ? { ...o, orderStatus: "out_for_delivery", status: "out_for_delivery" }
        : o
    );
    updateOrderInStorage(updated);
  };

  const handleDeliverAndCollectCash = (order: any) => {
    const amount = Number(order.totalAmount || order.total || 2450);
    const newCash = cashInHand + amount;
    const newAge = cashAgeHours === 0 ? 1 : cashAgeHours;

    // Update order to delivered
    const updated = orders.map((o) =>
      o.id === order.id || o.orderNumber === order.id
        ? {
            ...o,
            orderStatus: "delivered",
            status: "delivered",
            paymentStatus: "paid",
            deliveredAt: new Date().toISOString(),
          }
        : o
    );
    updateOrderInStorage(updated);
    syncRiderState(newCash, newAge, depositPending);
  };

  // Fast forward 1 hour demo
  const handleFastForwardHour = () => {
    const newAge = cashAgeHours + 1;
    syncRiderState(cashInHand, newAge, depositPending);
  };

  // Open Deposit Modal
  const openDepositModal = () => {
    setDepositAmount(cashInHand);
    setIsDepositModalOpen(true);
    setDepositSuccessMsg(null);
  };

  // Submit Deposit
  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRider) return;

    const newDeposit = {
      id: `DEP-${Math.floor(10000 + Math.random() * 90000)}`,
      riderId: activeRider.id,
      riderName: activeRider.name,
      storeId: activeRider.storeId || "BM-S01",
      storeName: "BuyMe Batticaloa Town",
      amount: depositAmount,
      refNumber: depositRef || `BOC-SLIP-${Math.floor(100000 + Math.random() * 900000)}`,
      slipImage: depositSlipUrl,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem("buyme_deposits");
      const list = stored ? JSON.parse(stored) : [];
      const updatedList = [newDeposit, ...list];
      localStorage.setItem("buyme_deposits", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("buyme_deposits_updated"));
    } catch (err) {}

    syncRiderState(cashInHand, cashAgeHours, true);
    setDepositSuccessMsg(`Deposit for LKR ${depositAmount.toLocaleString()} submitted! Awaiting Store Admin verification.`);
    setTimeout(() => {
      setIsDepositModalOpen(false);
      setDepositSuccessMsg(null);
    }, 2000);
  };

  if (!session || !activeRider) {
    return (
      <div className="min-h-screen bg-[#FFFDFD] aurora-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#E4002B] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Filter orders assigned to this rider
  const assignedOrders = orders.filter(
    (o) =>
      o.riderId === activeRider.id ||
      (o.riderName && o.riderName.toLowerCase().includes(activeRider.name.split(" ")[0].toLowerCase()))
  );

  // Unassigned store orders that could be accepted
  const unassignedStoreOrders = orders.filter(
    (o) =>
      (!o.riderId || o.riderId === "") &&
      (o.orderStatus === "placed" || o.orderStatus === "pending")
  );

  return (
    <div className="min-h-screen bg-[#FFFDFD] aurora-bg flex flex-col font-sans">
      {/* Demo Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs flex items-center justify-between text-amber-900">
        <span className="font-medium text-[11px] sm:text-xs">
          ⚠️ <strong>DEMO</strong> — Simulated Rider Shift & Cash Threshold (LKR 10,000 max limit & 4-Hour Rule).
        </span>
        <button
          onClick={handleResetData}
          className="text-[11px] font-bold text-amber-900 underline hover:text-[#E4002B] ml-2 shrink-0"
        >
          Reset demo data
        </button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-surface border-b border-white/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-extrabold text-[#1F2430]">
            Buy<span className="text-[#E4002B]">Me</span>{" "}
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold ml-1">
              Rider Dispatch
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const nextState = !isOnline;
              setIsOnline(nextState);
              syncRiderState(cashInHand, cashAgeHours, depositPending, nextState);
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              isOnline ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-gray-200 text-gray-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`}></span>
            {isOnline ? "Online (Active Shift)" : "Offline"}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#E4002B] px-3 py-1.5 rounded-xl hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Lock Warning Banner */}
        {isLocked && (
          <div className="p-4 rounded-3xl bg-red-50 border-2 border-red-200 text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E4002B] text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#B80022]">
                  {depositPending
                    ? "Deposit Pending Admin Verification"
                    : isOverThreshold
                    ? "Cash Threshold Reached (>= LKR 10,000) — Shift Locked"
                    : isExpiredCash
                    ? "4-Hour Holding Rule Triggered — Shift Locked"
                    : "Shift Offline"}
                </h3>
                <p className="text-xs text-red-700 mt-0.5">
                  {depositPending
                    ? "Your bank deposit slip is queued for verification. You cannot accept new orders until Store Admin approves."
                    : isOverThreshold
                    ? "You must deposit the WHOLE collected cash amount before accepting new orders."
                    : isExpiredCash
                    ? `Cash has been held for ${cashAgeHours} hours. Regulations require deposit within 4 hours even if under LKR 10,000.`
                    : "Turn shift online to receive orders."}
                </p>
              </div>
            </div>
            {!depositPending && cashInHand > 0 && (
              <button
                onClick={openDepositModal}
                className="px-5 py-2.5 rounded-2xl bg-[#E4002B] text-white font-bold text-xs hover:bg-[#B80022] shadow-md shadow-red-500/20 shrink-0 text-center"
              >
                Deposit Cash Now
              </button>
            )}
          </div>
        )}

        {/* Rider Profile Card & Cash Meter */}
        <div className="glass-surface-elevated rounded-3xl p-6 border border-white/80 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Logged in Rider
              </span>
              <h1 className="text-2xl font-extrabold text-[#1F2430]">{activeRider.name}</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Rider ID: <strong>{activeRider.id}</strong> • Stationed Hub:{" "}
                <strong>{activeRider.storeId || "BM-S01 (Batticaloa Town)"}</strong>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Delivery Vehicle
              </span>
              <p className="text-sm font-bold text-[#1F2430]">
                {activeRider.vehicleType || "Motorcycle"} • {activeRider.vehiclePlate || activeRider.vehicleNumber || "EP BDF-4821"}
              </p>
            </div>
          </div>

          {/* Cash Meter */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-gray-200/90 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Cash-In-Hand (COD Collected)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-extrabold text-[#E4002B] text-2xl">
                    LKR {cashInHand.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    / LKR {threshold.toLocaleString()} limit
                  </span>
                </div>
              </div>

              {/* Fast Forward 1-hr Demo Button */}
              <div className="flex items-center gap-2">
                <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Cash Age: <strong>{cashAgeHours} hour{cashAgeHours === 1 ? "" : "s"}</strong>
                  </span>
                </div>
                <button
                  onClick={handleFastForwardHour}
                  title="Advance timer by 1 hour to test the 4-hour deposit rule"
                  className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>+1 Hr</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-200/80">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cashInHand >= threshold
                    ? "bg-red-600"
                    : cashInHand >= threshold * 0.75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, (cashInHand / threshold) * 100)}%` }}
              ></div>
            </div>

            {/* Bottom Meter Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 pt-1 gap-2">
              <div className="flex items-center gap-2">
                {isOverThreshold ? (
                  <span className="font-bold text-[#E4002B] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Over limit! Must deposit whole LKR {cashInHand.toLocaleString()}.
                  </span>
                ) : isExpiredCash ? (
                  <span className="font-bold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Over 4 hours! Deposit required even under LKR 10k.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Capacity OK: Can continue accepting deliveries.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openDepositModal}
                  disabled={cashInHand === 0 || depositPending}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    cashInHand > 0 && !depositPending
                      ? "bg-[#E4002B] text-white hover:bg-[#B80022] shadow-sm"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {depositPending ? "Deposit Verification Pending" : "Deposit Cash"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Deliveries Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1F2430] font-heading">
              Assigned Orders ({assignedOrders.length})
            </h2>
            <span className="text-xs text-gray-500">Live order dispatch & delivery actions</span>
          </div>

          {assignedOrders.length === 0 ? (
            <div className="glass-surface rounded-3xl p-8 text-center text-gray-500 text-xs border border-white/80 space-y-2">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-1" />
              <p className="font-bold text-gray-700">No active deliveries assigned to your roster</p>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                Orders assigned by the Admin Hub will appear here in real-time. You can also self-accept any unassigned orders below.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedOrders.map((order: any) => {
                const isDelivered = order.orderStatus === "delivered" || order.status === "delivered";
                const isOut = order.orderStatus === "out_for_delivery" || order.status === "out_for_delivery";
                const isPreparing = order.orderStatus === "preparing" || order.status === "preparing";
                const isConfirmed = order.orderStatus === "confirmed" || order.orderStatus === "placed";

                return (
                  <div
                    key={order.id}
                    className="glass-surface-elevated rounded-3xl p-5 border border-white/80 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#E4002B] bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                            {order.orderNumber || order.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              isDelivered
                                ? "bg-emerald-100 text-emerald-800"
                                : isOut
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-[#B80022]"
                            }`}
                          >
                            {(order.orderStatus || "assigned").replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-[#1F2430] mt-1.5">
                          {order.customerName || "Customer Delivery"}
                        </h3>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <span>📍</span>
                          <span>
                            {typeof order.deliveryAddress === "string"
                              ? order.deliveryAddress
                              : `${order.deliveryAddress?.street || "Bar Road"}, Batticaloa`}
                          </span>
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 uppercase inline-block">
                          COD: LKR {Number(order.totalAmount || order.total || 1850).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Delivery Action Buttons */}
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3">
                      {isConfirmed && (
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={isLocked}
                          className={`flex-1 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                            isLocked
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-[#E4002B] text-white hover:bg-[#B80022] shadow-md shadow-red-500/20"
                          }`}
                        >
                          {isLocked ? "Shift Locked — Deposit Required" : "Step 1: Accept Order"}
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          onClick={() => handlePickupOrder(order.id)}
                          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-amber-600/20 transition-all"
                        >
                          Step 2: Pick Up from Store Hub
                        </button>
                      )}

                      {isOut && (
                        <button
                          onClick={() => handleDeliverAndCollectCash(order)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Step 3: Confirm Delivery & Collect LKR {Number(order.totalAmount || order.total || 0).toLocaleString()} (COD)</span>
                        </button>
                      )}

                      {isDelivered && (
                        <div className="flex-1 py-2 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivery Completed & Cash Collected</span>
                        </div>
                      )}

                      <a
                        href={`tel:${order.customerPhone || "+94773456789"}`}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold text-xs hover:bg-gray-50 flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        <span>Call Customer</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Unassigned Store Orders Self-Accept (Optional Fallback) */}
          {unassignedStoreOrders.length > 0 && (
            <div className="mt-8 space-y-3 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider">
                Unassigned Store Orders Available ({unassignedStoreOrders.length})
              </h3>
              <div className="space-y-2.5">
                {unassignedStoreOrders.slice(0, 3).map((uo) => (
                  <div
                    key={uo.id}
                    className="p-3.5 rounded-2xl bg-white/70 border border-gray-200/70 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-xs text-[#1F2430]">{uo.orderNumber || uo.id}</span>
                      <span className="text-xs text-gray-500 block">
                        {uo.customerName} • LKR {Number(uo.totalAmount || uo.total || 0).toLocaleString()} (COD)
                      </span>
                    </div>
                    <button
                      onClick={() => handleAcceptOrder(uo.id)}
                      disabled={isLocked}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isLocked
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-50 text-[#E4002B] hover:bg-red-100"
                      }`}
                    >
                      {isLocked ? "Locked" : "Claim Order"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-white/80 shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#E4002B] uppercase tracking-wider">
                Cash Meter Reconciliation
              </span>
              <h3 className="text-lg font-extrabold text-[#10243B] font-heading mt-0.5">
                Submit Cash Deposit Slip
              </h3>
              <p className="text-xs text-[#62748A] mt-0.5">
                {isOverThreshold
                  ? "Cash in hand exceeds LKR 10,000 limit. You must deposit the WHOLE amount."
                  : "Hand over cash to bank/store and upload verification reference."}
              </p>
            </div>

            {depositSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{depositSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDeposit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Deposit Amount (LKR)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => {
                      // If over threshold, rule says "must deposit the WHOLE amount"
                      if (!isOverThreshold) setDepositAmount(Number(e.target.value));
                    }}
                    readOnly={isOverThreshold}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                      isOverThreshold
                        ? "bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed"
                        : "bg-white border-gray-300 text-[#1F2430] focus:border-[#E4002B]"
                    }`}
                  />
                  {isOverThreshold && (
                    <span className="text-[10px] text-[#E4002B] font-semibold mt-1 block">
                      🔒 Enforced: Whole amount must be deposited when limit is exceeded.
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Bank / Transaction Reference Number
                  </label>
                  <input
                    type="text"
                    required
                    value={depositRef}
                    onChange={(e) => setDepositRef(e.target.value)}
                    placeholder="e.g. BOC-DEP-884920"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-[#1F2430] focus:border-[#E4002B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Deposit Slip / Stamped Bank Receipt
                  </label>
                  <div className="border border-dashed border-gray-300 rounded-2xl p-3 bg-gray-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E4002B] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">boc_deposit_slip_batticaloa.jpg</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">✓ Bank Stamped & Verified (1.2 MB)</p>
                      </div>
                    </div>
                    <label className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold cursor-pointer hover:bg-gray-100 shrink-0">
                      Change
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setDepositSlipUrl(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#E4002B] hover:bg-[#B80022] text-white font-bold text-xs shadow-md shadow-red-500/20"
                  >
                    Submit for Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
