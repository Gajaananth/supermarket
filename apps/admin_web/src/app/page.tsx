import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Package,
  ShoppingBasket,
  Store,
} from "lucide-react";
import { apiJson, backendUrl } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

interface StoreSummary {
  id: string;
  code: string;
  name: string;
  address: string;
  locality: string;
  openingTime: string;
  closingTime: string;
}

interface StoreProduct {
  id: string;
  customPrice: string | null;
  isAvailable: boolean;
  masterProduct: {
    id: string;
    name: string;
    description: string | null;
    unit: string;
    baseSellingPrice: string;
    imageUrl: string | null;
    category: {
      name: string;
      icon: string | null;
    };
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOptionalString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStoreSummary(value: unknown): value is StoreSummary {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    typeof value.name === "string" &&
    typeof value.address === "string" &&
    typeof value.locality === "string" &&
    typeof value.openingTime === "string" &&
    typeof value.closingTime === "string";
}

function isStoreProduct(value: unknown): value is StoreProduct {
  if (!isRecord(value) || !isRecord(value.masterProduct)) return false;
  const product = value.masterProduct;
  if (!isRecord(product.category)) return false;
  return typeof value.id === "string" &&
    isOptionalString(value.customPrice) &&
    typeof value.isAvailable === "boolean" &&
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    isOptionalString(product.description) &&
    typeof product.unit === "string" &&
    typeof product.baseSellingPrice === "string" &&
    isOptionalString(product.imageUrl) &&
    typeof product.category.name === "string" &&
    isOptionalString(product.category.icon);
}

async function loadMainStoreCatalog(): Promise<{
  store: StoreSummary | null;
  products: StoreProduct[];
  unavailable: boolean;
}> {
  try {
    const storesResponse = await fetch(backendUrl("/api/v1/stores"), { cache: "no-store" });
    const storesPayload = await apiJson<unknown>(storesResponse);
    if (
      !isRecord(storesPayload) ||
      !Array.isArray(storesPayload.stores) ||
      !storesPayload.stores.every(isStoreSummary)
    ) {
      throw new Error("The store endpoint returned an invalid response.");
    }
    const store = storesPayload.stores.find((item) => item.code === "BM-S01") ?? null;
    if (!store) return { store: null, products: [], unavailable: false };

    const catalogResponse = await fetch(
      backendUrl(`/api/v1/stores/${encodeURIComponent(store.id)}/catalog`),
      { cache: "no-store" },
    );
    const catalogPayload = await apiJson<unknown>(catalogResponse);
    if (!Array.isArray(catalogPayload) || !catalogPayload.every(isStoreProduct)) {
      throw new Error("The main store catalog endpoint returned an invalid response.");
    }
    return { store, products: catalogPayload, unavailable: false };
  } catch (error) {
    console.error("Could not load the main store catalog.", error);
    return { store: null, products: [], unavailable: true };
  }
}

function formatPrice(value: string): string {
  const price = Number(value);
  return `LKR ${new Intl.NumberFormat("en-LK", { maximumFractionDigits: 2 }).format(price)}`;
}

export default async function CustomerHomePage() {
  const { store, products, unavailable } = await loadMainStoreCatalog();

  return (
    <main className="aurora-bg min-h-screen">
      <header className="relative z-10 border-b border-white/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="BuyMe home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-buyme-primary font-heading text-xl font-extrabold text-white shadow-glass">
              B
            </span>
            <span className="font-heading text-xl font-extrabold text-buyme-navy">
              Buy<span className="text-buyme-primary">Me</span>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-6">
            <a href="#products" className="hidden text-sm font-semibold text-slate-600 hover:text-buyme-primary sm:inline">
              Products
            </a>
            <Link
              href="/customer/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-buyme-primary px-4 text-sm font-bold text-white transition hover:bg-buyme-primary-deep focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              <ShoppingBasket size={17} aria-hidden="true" />
              Sign in to order
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[480px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-buyme-primary">
            <MapPin size={14} aria-hidden="true" />
            Main store · BM-S01
          </p>
          <h1 className="mt-6 max-w-2xl font-heading text-4xl font-extrabold leading-tight tracking-tight text-buyme-navy sm:text-5xl lg:text-6xl">
            Your everyday groceries, all in one place.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Start with BuyMe Batticaloa Town. Browse the products available at our main store, then sign in when you are ready to order.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#products"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-buyme-primary px-5 text-sm font-extrabold text-white shadow-red-glow transition hover:bg-buyme-primary-deep"
            >
              Browse products <ArrowRight size={17} aria-hidden="true" />
            </a>
            <Link
              href="/customer/login"
              className="inline-flex min-h-12 items-center rounded-xl border border-slate-200 bg-white/80 px-5 text-sm font-bold text-buyme-navy transition hover:border-buyme-primary hover:text-buyme-primary"
            >
              Customer sign in
            </Link>
          </div>
        </div>

        <div className="glass-surface relative rounded-[2rem] border border-white/80 p-6 shadow-glass-elevated sm:p-8">
          <div className="absolute -right-3 -top-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-buyme-yellow text-buyme-navy shadow-card">
            <ShoppingBasket size={25} aria-hidden="true" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-buyme-primary">Your starting store</p>
          <h2 className="mt-3 font-heading text-2xl font-extrabold text-buyme-navy sm:text-3xl">
            {store?.name ?? "BuyMe Batticaloa Town"}
          </h2>
          <div className="mt-7 rounded-2xl bg-white/85 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-buyme-primary">
                <Store size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-buyme-navy">{store?.locality ?? "Puliyanthivu"}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {store?.address ?? "Main store · Batticaloa"}
                </p>
              </div>
            </div>
            {store && (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-600">
                Open daily · {store.openingTime}–{store.closingTime}
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="products" className="relative z-10 bg-white/75 py-14 backdrop-blur-sm sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-buyme-primary">
                {store ? `${store.code} · ${store.locality}` : "Shop local"}
              </p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-buyme-navy">
                Products at the main store
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-slate-600">
              Showing products currently available from {store?.name ?? "BuyMe Batticaloa Town"}.
            </p>
          </div>

          {unavailable ? (
            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950" role="status">
              The main store catalog is temporarily unavailable. Please try again later.
            </div>
          ) : !store ? (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600" role="status">
              The main store is not available right now.
            </div>
          ) : products.length === 0 ? (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600" role="status">
              No products are currently available from this store.
            </div>
          ) : (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((item) => {
                const product = item.masterProduct;
                const price = item.customPrice ?? product.baseSellingPrice;
                return (
                  <article key={item.id} className="flex flex-col rounded-2xl border border-white bg-white p-4 shadow-card">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-amber-50">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-full w-full rounded-xl object-contain p-3"
                        />
                      ) : (
                        <span className="text-5xl" aria-hidden="true">
                          {product.category.icon || <Package size={42} className="text-buyme-primary" />}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-buyme-primary">
                      {product.category.name}
                    </p>
                    <h3 className="mt-1 min-h-12 font-heading text-base font-extrabold leading-6 text-buyme-navy">
                      {product.name}
                    </h3>
                    <div className="mt-3 flex items-baseline justify-between gap-2">
                      <p className="font-heading text-lg font-extrabold text-buyme-primary">{formatPrice(price)}</p>
                      <p className="text-xs font-semibold text-slate-500">per {product.unit}</p>
                    </div>
                    <Link
                      href="/customer/login"
                      className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-sm font-extrabold text-buyme-primary transition hover:bg-rose-100"
                    >
                      <ShoppingBasket size={15} aria-hidden="true" />
                      Sign in to order
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">BuyMe · Batticaloa District</p>
        </div>
      </footer>
    </main>
  );
}
