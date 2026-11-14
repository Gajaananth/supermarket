"use client";

import React from "react";
import RidersView from "@/views/RidersView";
import { useAdminData } from "@/context/AdminContext";

export default function RidersPage() {
  const {
    riders,
    setRiders,
    deposits,
    approveDeposit,
    rejectDeposit,
  } = useAdminData();

  const handleToggleRiderStatus = (id: string) => {
    setRiders((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              shiftStatus: r.shiftStatus === "active" ? "offline" : "active",
              status: r.status === "offline" ? "available" : "offline",
            }
          : r
      );
      try {
        localStorage.setItem("buyme_riders", JSON.stringify(updated));
        window.dispatchEvent(new Event("buyme_riders_updated"));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <RidersView
      riders={riders}
      deposits={deposits}
      onToggleRiderStatus={handleToggleRiderStatus}
      onApproveDeposit={approveDeposit}
      onRejectDeposit={rejectDeposit}
    />
  );
}
