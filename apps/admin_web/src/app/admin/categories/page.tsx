"use client";

import React from "react";
import CategoriesView from "@/views/CategoriesView";
import { useAdminData } from "@/context/AdminContext";

export default function CategoriesPage() {
  const { categories } = useAdminData();
  return <CategoriesView categories={categories} />;
}
