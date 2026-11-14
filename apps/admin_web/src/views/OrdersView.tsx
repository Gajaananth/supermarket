"use client";

import React, { useState } from "react";
import { Search, Filter, Eye, UserPlus, Check, X, MapPin, Phone, AlertCircle, Lock, ShieldAlert, Clock } from "lucide-react";

interface OrdersViewProps {
  orders: any[];
  riders: any[];
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onAssignRider: (orderId: string, riderId: string) => void;
}

export default function OrdersView({
  orders,
  riders,
  onUpdateStatus,
  onAssignRider,
}: OrdersViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [assignRiderModalOrder, setAssignRiderModalOrder] = useState<any | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.storeName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    const matchesStore = storeFilter === "all" || o.storeId === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Orders Management
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Dispatch, track, and manage all simulated grocery orders in real-time.
          </p>
        </div>
        <div className="text-xs bg-red-50 text-[#B80022] border border-red-100 px-3.5 py-1.5 rounded-full font-bold">
          {filteredOrders.length} of {orders.length} Orders Displayed
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(16,36,59,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-[#10243B] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="placed">Placed (New)</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Store Filter */}
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-[#10243B] focus:outline-none cursor-pointer"
          >
            <option value="all">All Batticaloa Stores</option>
            <option value="br-btc-01">BuyMe Batticaloa Town</option>
            <option value="br-btc-02">BuyMe Kattankudy</option>
            <option value="br-btc-03">BuyMe Eravur</option>
            <option value="br-btc-04">BuyMe Valaichenai</option>
            <option value="br-btc-05">BuyMe Oddamavadi</option>
            <option value="br-btc-06">BuyMe Chenkalady</option>
            <option value="br-btc-07">BuyMe Kaluwanchikudy</option>
            <option value="br-btc-08">BuyMe Arayampathy</option>
            <option value="br-btc-09">BuyMe Kiran</option>
            <option value="br-btc-10">BuyMe Vellavely</option>
          </select>
        </div>

        {search || statusFilter !== "all" || storeFilter !== "all" ? (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setStoreFilter("all");
            }}
            className="text-xs text-rose-500 font-bold hover:underline"
          >
            Reset Filters
          </button>
        ) : null}
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[#62748A] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-4 px-6">Reference</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Store</th>
                <th className="py-4 px-4">Items</th>
                <th className="py-4 px-4">Total (LKR)</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Assigned Rider</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-red-50/30 transition-colors">
                    {/* Reference */}
                    <td className="py-4 px-6 font-bold text-[#10243B] font-heading">
                      {order.orderNumber}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {order.createdAt.split("T")[0]}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4 font-semibold text-[#10243B]">
                      {order.customerName}
                      <span className="block text-[10px] text-slate-400">{order.customerPhone}</span>
                    </td>

                    {/* Store */}
                    <td className="py-4 px-4 text-[#62748A]">
                      {order.storeName || "BuyMe Batticaloa"}
                    </td>

                    {/* Items */}
                    <td className="py-4 px-4 text-[#10243B] font-medium">
                      {order.items.reduce((s: number, i: any) => s + (i.quantity || i.qty || 1), 0)} items
                    </td>

                    {/* Total */}
                    <td className="py-4 px-4 font-extrabold text-[#10243B] font-heading">
                      LKR {Number(order.totalAmount || order.total || 0).toLocaleString()}
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-medium text-slate-600 block">
                        {order.paymentMethod}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer focus:outline-none border ${
                          order.orderStatus === "delivered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : order.orderStatus === "out_for_delivery"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : order.orderStatus === "placed"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : order.orderStatus === "preparing"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : order.orderStatus === "cancelled"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <option value="placed">Placed (New)</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready_for_pickup">Ready for Pickup</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Assigned Rider */}
                    <td className="py-4 px-4">
                      {order.riderName ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-[#10243B] text-xs">{order.riderName}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssignRiderModalOrder(order)}
                          className="text-[11px] font-bold text-[#E4002B] hover:underline flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Assign Rider</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-red-50 text-[#E4002B] hover:bg-blue-100 transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!order.riderName && (
                          <button
                            onClick={() => setAssignRiderModalOrder(order)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Assign Delivery Rider"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-[#B80022] font-bold px-2.5 py-1 rounded-full font-heading">
                {selectedOrder.orderNumber}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {(selectedOrder.createdAt || "").replace("T", " ")}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-[#10243B] font-heading mt-2">
              Order Breakdown & Routing
            </h3>

            {/* Customer Details */}
            <div className="mt-4 p-3.5 rounded-2xl bg-red-50/70 border border-red-100 text-xs space-y-1">
              <div className="font-bold text-[#10243B] flex items-center justify-between">
                <span>Customer: {selectedOrder.customerName}</span>
                <span className="text-[#E4002B] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {selectedOrder.customerPhone}
                </span>
              </div>
              <div className="text-[#62748A] flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {typeof selectedOrder.deliveryAddress === "string"
                    ? selectedOrder.deliveryAddress
                    : `${selectedOrder.deliveryAddress.street}, ${selectedOrder.deliveryAddress.city}`}
                </span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="mt-4 max-h-48 overflow-y-auto space-y-2 pr-1">
              {selectedOrder.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50">
                  <div>
                    <span className="font-bold text-[#10243B]">{item.productName || item.name}</span>
                    <span className="text-[#62748A] block text-[11px]">
                      {(item.quantity || item.qty || 1)} � LKR {Number(item.unitPrice || item.price || 0).toLocaleString()} ({item.unit})
                    </span>
                  </div>
                  <strong className="text-[#10243B] font-heading">
                    LKR {Number(item.totalPrice || item.subtotal || 0).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between text-[#62748A]">
                <span>Subtotal</span>
                <span>LKR {Number(selectedOrder.subtotal || selectedOrder.itemsTotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#62748A]">
                <span>Delivery Fee ({selectedOrder.storeName.split(" ")[0]})</span>
                <span>LKR {Number(selectedOrder.deliveryFee || 250).toLocaleString()}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>- LKR {Number(selectedOrder.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#10243B] pt-2 border-t border-dashed border-slate-200">
                <span>Grand Total (LKR)</span>
                <span className="text-[#E4002B]">LKR {Number(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-full bg-[#E4002B] text-white text-xs font-bold hover:bg-[#B80022] transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Rider Modal */}
      {assignRiderModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setAssignRiderModalOrder(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-[#E4002B]">
                  {assignRiderModalOrder.orderNumber}
                </span>
                <span className="text-xs text-[#62748A]">
                  Hub: <strong>{assignRiderModalOrder.storeName || 'Batticaloa Hub'}</strong>
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#10243B] font-heading mt-1">
                Dispatch Rider Assignment
              </h3>
              <p className="text-xs text-[#62748A] mt-0.5">
                Assign an eligible rider from this store hub. Locked riders cannot accept orders until cash deposits are reconciled.
              </p>
            </div>

            {/* Rider list for this store */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
              {(() => {
                const matchStore = (riderStore, orderStore) => {
                  if (!riderStore || !orderStore) return false;
                  if (riderStore.toLowerCase() === orderStore.toLowerCase()) return true;
                  const num1 = riderStore.replace(/\D/g, '');
                  const num2 = orderStore.replace(/\D/g, '');
                  return Boolean(num1 && num2 && parseInt(num1, 10) === parseInt(num2, 10));
                };

                const storeRiders = riders.filter((r) =>
                  matchStore(r.storeId, assignRiderModalOrder.storeId)
                );

                if (storeRiders.length === 0) {
                  return (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#10243B]">No riders registered for this store hub</p>
                      <p className="text-[11px] text-[#62748A] mt-0.5">
                        Please check store roster settings or assign a fleet rider.
                      </p>
                    </div>
                  );
                }

                return storeRiders.map((r) => {
                  const cash = Number(r.cashInHand || 0);
                  const cashAge = Number(r.cashAgeHours || 0);
                  let lockReason = null;

                  if (r.depositPending) {
                    lockReason = "Locked: Deposit pending Store Admin verification";
                  } else if (cash >= 10000) {
                    lockReason = `Locked: Cash limit exceeded (LKR ${cash.toLocaleString()} / LKR 10,000 max)`;
                  } else if (cashAge >= 4 && cash > 0) {
                    lockReason = `Locked: Cash held > 4 hours (${cashAge}h elapsed)`;
                  } else if (r.status === "offline" || r.shiftStatus === "offline" || r.isOnline === false) {
                    lockReason = "Locked: Rider is currently offline";
                  }

                  const isLocked = Boolean(lockReason);

                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        if (isLocked) return;
                        onAssignRider(assignRiderModalOrder.id, r.id);
                        setAssignRiderModalOrder(null);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLocked
                          ? 'bg-slate-100/70 border-slate-200/80 opacity-65 cursor-not-allowed select-none'
                          : 'bg-white hover:bg-red-50/50 border-slate-200/80 hover:border-[#E4002B] cursor-pointer shadow-sm hover:shadow'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isLocked ? 'bg-slate-300 text-slate-600' : 'bg-[#E4002B] text-white'
                          }`}
                        >
                          {r.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#10243B] truncate">{r.name}</span>
                            <span className="text-[10px] text-[#62748A]">({r.id})</span>
                          </div>
                          <div className="text-[11px] text-[#62748A] truncate">
                            {r.vehicleType || 'Motorcycle'} • {r.vehiclePlate || r.vehicleNumber || 'EP-XXXX'}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                            Cash in hand: <span className={cash >= 10000 ? 'text-[#E4002B] font-bold' : 'text-[#10243B]'}>LKR {cash.toLocaleString()}</span>
                            {cashAge > 0 && <span className="text-slate-400 text-[10px] ml-1.5 font-normal">({cashAge}h held)</span>}
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        {isLocked ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-100/90 text-[#B80022] text-[10.5px] font-bold">
                            <Lock className="w-3 h-3 shrink-0" />
                            <span>{lockReason}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="w-full sm:w-auto px-4 py-1.5 rounded-full bg-[#E4002B] text-white text-xs font-bold hover:bg-[#B80022] shadow-sm"
                          >
                            Assign to Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#62748A]">
              <span>💡 Filtered strictly to riders stationed at this store hub.</span>
              <button
                onClick={() => setAssignRiderModalOrder(null)}
                className="font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
