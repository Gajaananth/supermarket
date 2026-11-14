"use client";

import React from "react";
import InventoryView from "@/views/InventoryView";
import { useAdminData } from "@/context/AdminContext";

export default function InventoryPage() {
  const { inventory, setInventory } = useAdminData();

  const handleAdjustStock = (productId: string, storeId: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.productId === productId && item.storeId === storeId
          ? { ...item, stockLevel: Math.max(0, (item.stockLevel || 0) + delta) }
          : item
      )
    );
  };

  return <InventoryView inventory={inventory} onAdjustStock={handleAdjustStock} />;
}
