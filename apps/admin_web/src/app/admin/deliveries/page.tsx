"use client";

import React from "react";
import DeliveriesView from "@/views/DeliveriesView";
import { useAdminData } from "@/context/AdminContext";

export default function DeliveriesPage() {
  const { orders, riders, stores } = useAdminData();
  return <DeliveriesView orders={orders} riders={riders} stores={stores} />;
}
