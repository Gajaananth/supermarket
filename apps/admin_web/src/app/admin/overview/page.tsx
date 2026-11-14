"use client";

import React from "react";
import OverviewView from "@/views/OverviewView";
import { useAdminData } from "@/context/AdminContext";
import { useRouter } from "next/navigation";

export default function OverviewPage() {
  const { orders, stores, products, riders, customers } = useAdminData();
  const router = useRouter();

  return (
    <OverviewView
      orders={orders}
      stores={stores}
      products={products}
      riders={riders}
      customers={customers}
      onNavigateToOrders={() => router.push("/admin/orders")}
    />
  );
}
