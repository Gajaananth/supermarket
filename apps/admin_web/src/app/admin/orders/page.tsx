"use client";

import React from "react";
import OrdersView from "@/views/OrdersView";
import { useAdminData } from "@/context/AdminContext";

export default function OrdersPage() {
  const { orders, setOrders, riders, setRiders } = useAdminData();

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? { ...o, orderStatus: newStatus, status: newStatus }
          : o
      );
      try {
        localStorage.setItem("buyme_orders", JSON.stringify(updated));
        window.dispatchEvent(new Event("buyme_orders_updated"));
      } catch (e) {}
      return updated;
    });
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    const assignedRider = riders.find((r) => r.id === riderId);
    const riderName = assignedRider ? assignedRider.name : "Assigned Rider";

    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? {
              ...o,
              riderId,
              riderName,
              orderStatus: o.orderStatus === "placed" ? "confirmed" : o.orderStatus,
              status: o.status === "placed" ? "confirmed" : o.status,
            }
          : o
      );
      try {
        localStorage.setItem("buyme_orders", JSON.stringify(updated));
        window.dispatchEvent(new Event("buyme_orders_updated"));
      } catch (e) {}
      return updated;
    });

    setRiders((prev) => {
      const updated = prev.map((r) =>
        r.id === riderId ? { ...r, activeOrderId: orderId, status: "delivering" } : r
      );
      try {
        localStorage.setItem("buyme_riders", JSON.stringify(updated));
        window.dispatchEvent(new Event("buyme_riders_updated"));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <OrdersView
      orders={orders}
      riders={riders}
      onUpdateStatus={handleUpdateStatus}
      onAssignRider={handleAssignRider}
    />
  );
}
