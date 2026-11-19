"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Package, ShoppingBasket, Store, UserRound } from "lucide-react";

interface SessionProfile {
  user: {
    id: string;
    role: "CUSTOMER";
    fullName: string;
    email: string | null;
    phone: string | null;
  };
}

interface StoreSummary {
  id: string;
  code: string;
  name: string;
  address: string;
  locality: string;
  openingTime: string;
  closingTime: string;
}

interface CatalogItem {
  id: string;
  customPrice: string | null;
  isAvailable: boolean;
  masterProduct: {
    name: string;
    description: string | null;
    unit: string;
    baseSellingPrice: string;
    imageUrl: string | null;
    category: { name: string; icon: string | null };
  };
}

export default function CustomerAccountPage() {
  const [session, setSession] = useState<SessionProfile | null>(null);
  const [store, setStore] = useState<StoreSummary | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        if (!sessionResponse.ok) throw new Error("Sign-in required");
        const sessionData = await sessionResponse.json() as SessionProfile;
        if (sessionData.user.role !== "CUSTOMER") throw new Error("Customer account required");
        setSession(sessionData);

        const storesResponse = await fetch("/api/backend/api/v1/stores", { cache: "no-store" });
        if (!storesResponse.ok) throw new Error("Store catalog unavailable");
        const storesBody = await storesResponse.json() as { data: { stores: StoreSummary[] } };
        const mainStore = storesBody.data.stores.find((item) => item.code === "BM-S01") ?? null;
        setStore(mainStore);

        if (mainStore) {
          const catalogResponse = await fetch(
            `/api/backend/api/v1/stores/${encodeURIComponent(mainStore.id)}/catalog`,
            { cache: "no-store" },
          );
          if (!catalogResponse.ok) throw new Error("Catalog unavailable");
          const catalogBody = await catalogResponse.json() as { data: CatalogItem[] };
          setCatalog(catalogBody.data);
        }
      } catch {
        window.location.replace("/customer/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/customer/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-buyme-canvas text-sm font-bold text-slate-600">
        Loading customer workspace…
      </main>
    );
  }

  if (!session) return null;

  return (
    <main className="min-h-screen bg-buyme-canvas px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-white bg-white p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-buyme-primary text-white">
              <UserRound size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-buyme-primary">Customer workspace</p>
              <h1 className="mt-1 font-heading text-xl font-extrabold text-buyme-navy">{session.user.fullName}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:border-buyme-primary hover:text-buyme-primary"
          >
            <LogOut size={16} aria-hidden="true" /> Logout
          </button>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-white bg-white p-5 shadow-card">
            <UserRound className="text-buyme-primary" size={20} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Account</p>
            <p className="mt-2 font-heading text-lg font-extrabold text-buyme-navy">{session.user.fullName}</p>
            <p className="mt-1 text-sm text-slate-600">{session.user.phone ?? session.user.email}</p>
          </article>

          <article className="rounded-3xl border border-white bg-white p-5 shadow-card">
            <Store className="text-buyme-primary" size={20} aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Main store</p>
            <p className="mt-2 font-heading text-lg font-extrabold text-buyme-navy">
              {store?.name ?? "BuyMe Batticaloa Town"}
            </p>
            <p className="mt-1 text-sm text-slate-600">{store ? `${store.code} · ${store.locality}` : "BM-S01"}</p>
          </article>
        </div>

        <section className="mt-5 rounded-3xl border border-white bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-buyme-primary">Available now</p>
              <h2 className="mt-1 font-heading text-2xl font-extrabold text-buyme-navy">Dairy &amp; Eggs</h2>
            </div>
            <p className="text-sm font-bold text-slate-500">{catalog.length} products</p>
          </div>

          {catalog.length === 0 ? (
            <p className="mt-5 rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
              No products are currently available.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {catalog.map((item) => {
                const price = item.customPrice ?? item.masterProduct.baseSellingPrice;
                const product = item.masterProduct;
                return (
                  <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-32 items-center justify-center rounded-xl bg-rose-50">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-xl object-contain p-3" />
                      ) : (
                        <Package size={38} className="text-buyme-primary" aria-hidden="true" />
                      )}
                    </div>
                    <p className="mt-3 text-xs font-bold text-buyme-primary">{product.category.name}</p>
                    <h3 className="mt-1 min-h-12 font-heading text-sm font-extrabold leading-5 text-buyme-navy">
                      {product.name}
                    </h3>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                      <p className="font-heading font-extrabold text-buyme-primary">
                        LKR {Number(price).toLocaleString("en-LK")}
                      </p>
                      <p className="text-xs text-slate-500">per {product.unit}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <Link href="/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-buyme-primary">
          <ShoppingBasket size={16} aria-hidden="true" /> Back to BuyMe storefront
        </Link>
      </section>
    </main>
  );
}
