"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Star, Package, Filter, X } from "lucide-react";

interface ProductsViewProps {
  products: any[];
  categories: any[];
  onAddProduct: (product: any) => void;
  onEditProduct: (productId: string, updates: any) => void;
}

export default function ProductsView({
  products,
  categories,
  onAddProduct,
  onEditProduct,
}: ProductsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState(500);
  const [unit, setUnit] = useState("1 kg");
  const [categoryName, setCategoryName] = useState("Fresh Produce");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Grocery Product Catalog
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Manage Sri Lankan grocery items, retail prices (LKR), SKU codes, and promotions.
          </p>
        </div>
        <button
          onClick={() => {
            setName("");
            setPrice(450);
            setUnit("1 kg");
            setIsAddOpen(true);
          }}
          className="px-4 py-2 rounded-full bg-[#E4002B] text-white text-xs font-bold hover:bg-[#B80022] transition-colors flex items-center gap-1.5 shadow-md shadow-red-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Demo Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(16,36,59,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rice, tea, milk, biscuits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-[#10243B] focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-[#62748A]">
          Showing <strong>{filteredProducts.length}</strong> items in LKR
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => {
          const totalStock = p.stock || Number(
            Object.values(p.stockByStore || {}).reduce(
              (a: any, b: any) => Number(a) + Number(b),
              0
            )
          ) || 30;
          const catName = p.categoryName || categories.find((c) => c.id === p.categoryId)?.name || "Groceries";
          const imgSrc = p.image || p.img || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";

          return (
            <div
              key={p.id}
              className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-red-500/10"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                {(p.discountPercent > 0 || p.discountPercentage > 0) && (
                  <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full font-heading">
                    {p.discountPercent || p.discountPercentage}% OFF
                  </span>
                )}
                <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Stock: {totalStock}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#E4002B] uppercase tracking-wider block font-heading">
                    {catName}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-[#10243B] mt-1 leading-snug">
                    {p.name}
                  </h4>
                  {p.nameTa && (
                    <span className="text-[11px] text-[#62748A] block font-medium mt-0.5">{p.nameTa}</span>
                  )}
                  <span className="text-xs text-[#62748A] block mt-0.5">{p.unit}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-extrabold text-[#10243B] font-heading">
                      LKR {Number(p.price || 0).toLocaleString()}
                    </span>
                    {(p.discountPercent || p.discountPercentage) && p.originalPrice ? (
                      <span className="text-[10px] text-slate-400 line-through block">
                        LKR {Number(p.originalPrice).toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setName(p.name);
                      setPrice(p.price);
                      setUnit(p.unit);
                    }}
                    className="p-2 rounded-xl bg-red-50 text-[#E4002B] hover:bg-blue-100 transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setIsAddOpen(false);
                setEditingProduct(null);
              }}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-extrabold text-[#10243B] font-heading">
              {editingProduct ? "Edit Product (Demo)" : "Add New Grocery Product"}
            </h3>
            <p className="text-xs text-[#62748A] mt-1">
              Set commercial parameters and packaging units for the Sri Lankan market.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#10243B] block mb-1">Product Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maliban Gold Marie Biscuits"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#10243B] block mb-1">Price in LKR</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#10243B] block mb-1">Unit / Packaging</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. 400 g pack"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#10243B] focus:outline-none focus:border-[#E4002B]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingProduct) {
                    onEditProduct(editingProduct.id, { name, price, unit });
                    setEditingProduct(null);
                  } else {
                    onAddProduct({
                      name: name || "Demo Product",
                      price,
                      unit,
                      categoryId: "cat-001",
                      categoryName: "Fresh Produce",
                      originalPrice: price,
                      discountPercent: 0,
                      rating: 4.8,
                      reviewCount: 1,
                      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
                      inStock: true,
                      stockByStore: { "store-001": 50, "store-002": 30, "store-003": 20 },
                    });
                    setIsAddOpen(false);
                  }
                }}
                className="px-5 py-2 rounded-full bg-[#E4002B] text-white text-xs font-bold hover:bg-[#B80022]"
              >
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

