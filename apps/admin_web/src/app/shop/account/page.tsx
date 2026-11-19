"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  LogOut,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBasket,
  Store,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

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
  quantityOnHand?: number;
  masterProduct: {
    id: string;
    name: string;
    description: string | null;
    unit: string;
    baseSellingPrice: string;
    imageUrl: string | null;
    category: { name: string; icon: string | null };
  };
}

interface CartItem {
  id: string;
  storeProductId: string;
  quantity: number;
  storeProduct: {
    id: string;
    quantityOnHand: number;
    quantityReserved: number;
    isAvailable: boolean;
    customPrice: string | null;
    name: string;
    unit: string;
    baseSellingPrice: string;
    imageUrl: string | null;
  };
}

interface Address {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  streetAddress: string;
  locality: string;
  isDefault: boolean;
}

function formatPrice(value: number) {
  return `LKR ${value.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
}

export default function CustomerAccountPage() {
  const [session, setSession] = useState<SessionProfile | null>(null);
  const [store, setStore] = useState<StoreSummary | null>(null);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        if (!sessionResponse.ok) throw new Error("Sign-in required");
        const sessionData = await sessionResponse.json() as SessionProfile;
        if (sessionData.user.role !== "CUSTOMER") throw new Error("Customer account required");
        setSession(sessionData);

        const [storesResponse, addressesResponse] = await Promise.all([
          fetch("/api/backend/api/v1/stores", { cache: "no-store" }),
          fetch("/api/backend/api/v1/addresses", { cache: "no-store" }),
        ]);
        if (!storesResponse.ok) throw new Error("Store catalog unavailable");
        const storesBody = await storesResponse.json() as { data: { stores: StoreSummary[] } };
        const mainStore = storesBody.data.stores.find((item) => item.code === "BM-S01") ?? null;
        setStore(mainStore);

        if (addressesResponse.ok) {
          const addressBody = await addressesResponse.json() as { data: Address[] };
          setAddresses(addressBody.data);
        }

        if (mainStore) {
          const [catalogResponse, cartResponse] = await Promise.all([
            fetch(`/api/backend/api/v1/stores/${encodeURIComponent(mainStore.id)}/catalog`, { cache: "no-store" }),
            fetch(`/api/backend/api/v1/cart/${encodeURIComponent(mainStore.id)}`, { cache: "no-store" }),
          ]);
          if (!catalogResponse.ok) throw new Error("Catalog unavailable");
          const catalogBody = await catalogResponse.json() as { data: CatalogItem[] };
          setCatalog(catalogBody.data);

          if (cartResponse.ok) {
            const cartBody = await cartResponse.json() as { data: { items: CartItem[] } };
            setCart(cartBody.data.items ?? []);
          }
        }
      } catch {
        window.location.replace("/customer/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const names = catalog.map((item) => item.masterProduct.category.name);
    return ["All", ...Array.from(new Set(names))];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog.filter((item) => {
      const matchesCategory = category === "All" || item.masterProduct.category.name === category;
      const matchesSearch = !term || item.masterProduct.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [catalog, category, search]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.storeProduct.customPrice
      ? Number(item.storeProduct.customPrice)
      : Number(item.storeProduct.baseSellingPrice);
    return sum + price * item.quantity;
  }, 0);

  const addToCart = async (item: CatalogItem) => {
    if (!store) return;
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/backend/api/v1/cart/${store.id}/items`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storeProductId: item.id, quantity: 1 }),
      });
      if (!response.ok) throw new Error("Could not add this item");
      const cartResponse = await fetch(`/api/backend/api/v1/cart/${store.id}`, { cache: "no-store" });
      if (cartResponse.ok) {
        const cartBody = await cartResponse.json() as { data: { items: CartItem[] } };
        setCart(cartBody.data.items ?? []);
      } else {
        const existing = cart.find((row) => row.storeProductId === item.id);
        if (existing) {
          setCart((rows) => rows.map((row) =>
            row.storeProductId === item.id ? { ...row, quantity: row.quantity + 1 } : row,
          ));
        } else {
          setCart((rows) => [
            ...rows,
            {
              id: `local-${item.id}`,
              storeProductId: item.id,
              quantity: 1,
              storeProduct: {
                id: item.id,
                quantityOnHand: 40,
                quantityReserved: 0,
                isAvailable: true,
                customPrice: item.customPrice,
                name: item.masterProduct.name,
                unit: item.masterProduct.unit,
                baseSellingPrice: item.masterProduct.baseSellingPrice,
                imageUrl: item.masterProduct.imageUrl,
              },
            },
          ]);
        }
      }
      setCartOpen(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update the cart.");
    } finally {
      setBusy(false);
    }
  };

  const updateCartItem = async (item: CartItem, quantity: number) => {
    if (!store || quantity < 1) return;
    setBusy(true);
    try {
      await fetch(`/api/backend/api/v1/cart/${store.id}/items/${item.storeProductId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      setCart((rows) => rows.map((row) =>
        row.storeProductId === item.storeProductId ? { ...row, quantity } : row,
      ));
    } finally {
      setBusy(false);
    }
  };

  const removeCartItem = async (item: CartItem) => {
    if (!store) return;
    setBusy(true);
    try {
      await fetch(`/api/backend/api/v1/cart/${store.id}/items/${item.storeProductId}`, { method: "DELETE" });
      setCart((rows) => rows.filter((row) => row.storeProductId !== item.storeProductId));
    } finally {
      setBusy(false);
    }
  };

  const checkout = async () => {
    if (!store) return;
    const address = addresses.find((item) => item.isDefault) ?? addresses[0];
    if (!address) {
      setNotice("No delivery address is available for checkout.");
      setCartOpen(true);
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/backend/api/v1/orders/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          deliveryAddressId: address.id,
          campaignCodes: [],
        }),
      });
      const body = await response.json() as { data?: { orderNumber: string }; message?: string };
      if (!response.ok) throw new Error(body.message ?? "Checkout could not be completed.");
      setCart([]);
      setCartOpen(false);
      setNotice(`Order ${body.data?.orderNumber ?? ""} placed successfully.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Checkout could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/customer/login");
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] text-sm font-bold text-slate-600">Loading BuyMe…</main>;
  }
  if (!session) return null;

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="BuyMe home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-buyme-primary font-heading text-xl font-extrabold text-white">B</span>
            <span className="hidden font-heading text-xl font-extrabold text-buyme-navy sm:block">Buy<span className="text-buyme-primary">Me</span></span>
          </Link>

          <div className="mx-auto hidden w-full max-w-xl md:block">
            <label className="relative block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dairy & eggs"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-buyme-primary focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:border-buyme-primary hover:text-buyme-primary"
          >
            <ShoppingBasket size={19} aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-buyme-primary px-1 text-[10px] text-white">{cartCount}</span>
            )}
          </button>
          <button type="button" onClick={() => void logout()} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:border-buyme-primary hover:text-buyme-primary" aria-label="Logout">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {notice && (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900" role="status">{notice}</p>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#4b171e] via-buyme-primary-deep to-[#e4003a] px-5 py-8 text-white sm:px-8 sm:py-10">
          <div className="relative z-10 max-w-xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/80">BuyMe Batticaloa</p>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-5xl">
              Fresh groceries, delivered to your door.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
              Welcome, {session.user.fullName}. Shop real BM-S01 dairy and egg products and place a COD order.
            </p>
          </div>
          <Store className="absolute bottom-[-20px] right-4 h-44 w-44 text-white/10 sm:right-10" aria-hidden="true" />
        </div>

        <div className="mt-5 md:hidden">
          <label className="relative block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none" />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-buyme-primary">{store?.code ?? "BM-S01"} · {store?.locality ?? "Puliyanthivu"}</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold text-buyme-navy">Shop products</h2>
          </div>
          <p className="text-sm font-bold text-slate-500">{filteredCatalog.length} items</p>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
                category === name ? "bg-buyme-primary text-white" : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {filteredCatalog.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">No products match your search.</div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCatalog.map((item) => {
              const quantity = cart.find((row) => row.storeProductId === item.id)?.quantity ?? 0;
              const price = Number(item.customPrice ?? item.masterProduct.baseSellingPrice);
              return (
                <article key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-glass-elevated">
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
                    {item.masterProduct.imageUrl ? (
                      <img src={item.masterProduct.imageUrl} alt={item.masterProduct.name} className="h-full w-full object-contain p-4 transition group-hover:scale-[1.03]" />
                    ) : (
                      <Package size={48} className="text-buyme-primary" aria-hidden="true" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-buyme-primary">{item.masterProduct.category.name}</p>
                    <h3 className="mt-2 min-h-12 font-heading text-base font-extrabold leading-6 text-buyme-navy">{item.masterProduct.name}</h3>
                    <p className="mt-2 font-heading text-xl font-extrabold text-buyme-primary">{formatPrice(price)}</p>
                    {quantity === 0 ? (
                      <button type="button" disabled={busy} onClick={() => void addToCart(item)} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-buyme-primary text-sm font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-60">
                        <Plus size={17} aria-hidden="true" /> Add to cart
                      </button>
                    ) : (
                      <div className="mt-4 flex h-11 items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-2">
                        <button type="button" aria-label={`Decrease ${item.masterProduct.name}`} onClick={() => {
                          const row = cart.find((cartRow) => cartRow.storeProductId === item.id);
                          if (row) void (quantity === 1 ? removeCartItem(row) : updateCartItem(row, quantity - 1));
                        }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-buyme-primary shadow-sm">
                          {quantity === 1 ? <Trash2 size={15} aria-hidden="true" /> : <Minus size={15} aria-hidden="true" />}
                        </button>
                        <span className="font-heading text-sm font-extrabold text-buyme-navy">{quantity}</span>
                        <button type="button" aria-label={`Increase ${item.masterProduct.name}`} onClick={() => {
                          const row = cart.find((cartRow) => cartRow.storeProductId === item.id);
                          if (row) void updateCartItem(row, quantity + 1);
                        }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-buyme-primary text-white">
                          <Plus size={15} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)} className="absolute inset-0" />
          <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-buyme-primary">Your cart</p>
                <h2 className="mt-1 font-heading text-xl font-extrabold text-buyme-navy">{cartCount} items</h2>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600">
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBasket size={44} className="text-slate-300" aria-hidden="true" />
                  <p className="mt-4 font-heading font-extrabold text-buyme-navy">Your cart is empty</p>
                  <button type="button" onClick={() => setCartOpen(false)} className="mt-4 text-sm font-bold text-buyme-primary">Continue shopping</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const price = item.storeProduct.customPrice
                      ? Number(item.storeProduct.customPrice)
                      : Number(item.storeProduct.baseSellingPrice);
                    return (
                      <article key={item.id} className="flex gap-3 rounded-2xl border border-slate-200 p-3">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-rose-50">
                          {item.storeProduct.imageUrl ? (
                            <img src={item.storeProduct.imageUrl} alt={item.storeProduct.name} className="h-full w-full object-contain p-2" />
                          ) : (
                            <Package size={26} className="text-buyme-primary" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-heading text-sm font-extrabold text-buyme-navy">{item.storeProduct.name}</p>
                          <p className="mt-1 text-sm font-bold text-buyme-primary">{formatPrice(price * item.quantity)}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button type="button" onClick={() => void (item.quantity === 1 ? removeCartItem(item) : updateCartItem(item, item.quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200">
                              {item.quantity === 1 ? <Trash2 size={14} aria-hidden="true" /> : <Minus size={14} aria-hidden="true" />}
                            </button>
                            <span className="min-w-6 text-center text-sm font-extrabold">{item.quantity}</span>
                            <button type="button" onClick={() => void updateCartItem(item, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-buyme-primary text-white">
                              <Plus size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <footer className="border-t border-slate-200 p-5">
                {addresses[0] && (
                  <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-bold text-slate-500">Delivering to</p>
                    <p className="mt-1 text-sm font-extrabold text-buyme-navy">{addresses.find((item) => item.isDefault)?.recipientName ?? addresses[0].recipientName}</p>
                    <p className="mt-1 text-xs text-slate-600">{addresses.find((item) => item.isDefault)?.streetAddress ?? addresses[0].streetAddress}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-600">Subtotal</p>
                  <p className="font-heading text-xl font-extrabold text-buyme-navy">{formatPrice(cartSubtotal)}</p>
                </div>
                <button type="button" disabled={busy} onClick={() => void checkout()} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-buyme-primary text-sm font-extrabold text-white hover:bg-buyme-primary-deep disabled:opacity-60">
                  Place COD order <ArrowRight size={17} aria-hidden="true" />
                </button>
              </footer>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
