"use client";

import React from "react";
import { Layers, Plus, Package } from "lucide-react";

interface CategoriesViewProps {
  categories: any[];
}

export default function CategoriesView({ categories }: CategoriesViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#10243B] tracking-tight font-heading">
            Department & Category Taxonomies
          </h2>
          <p className="text-sm text-[#62748A] mt-1">
            Organize products into intuitive grocery categories for the mobile apps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-3xl bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(16,36,59,0.04)] overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-red-500/10"
          >
            <div className="h-32 w-full overflow-hidden relative bg-slate-100">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <span className="absolute bottom-3 left-4 text-white font-heading font-extrabold text-base">
                {cat.name}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#62748A] leading-relaxed">{cat.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#E4002B] flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> {cat.productCount} Items Available
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{cat.slug}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

