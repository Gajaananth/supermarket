"use client";

import React from "react";
import ReportsView from "@/views/ReportsView";
import { useAdminData } from "@/context/AdminContext";

export default function ReportsPage() {
  const { orders, stores, products } = useAdminData();
  return <ReportsView orders={orders} stores={stores} products={products} />;
}
