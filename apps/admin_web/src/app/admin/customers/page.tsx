"use client";

import React from "react";
import CustomersView from "@/views/CustomersView";
import { useAdminData } from "@/context/AdminContext";

export default function CustomersPage() {
  const { customers } = useAdminData();
  return <CustomersView customers={customers} />;
}
