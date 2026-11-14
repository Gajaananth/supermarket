"use client";

import React from "react";
import ProductsView from "@/views/ProductsView";
import { useAdminData } from "@/context/AdminContext";

export default function ProductsPage() {
  const { products, setProducts, categories } = useAdminData();

  const handleAddProduct = (newProd: any) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleEditProduct = (id: string, updates: any) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  return (
    <ProductsView
      products={products}
      categories={categories}
      onAddProduct={handleAddProduct}
      onEditProduct={handleEditProduct}
    />
  );
}
