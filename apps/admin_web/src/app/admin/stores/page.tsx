"use client";

import React from "react";
import StoresView from "@/views/StoresView";
import { useAdminData } from "@/context/AdminContext";

export default function StoresPage() {
  const { stores, setStores } = useAdminData();

  const handleToggleStatus = (id: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s))
    );
  };

  return <StoresView stores={stores} onToggleStatus={handleToggleStatus} />;
}
