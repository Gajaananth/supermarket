"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  storesData,
  categoriesData,
  productsData,
  ridersData,
  customersData,
  ordersData,
  inventoryData,
} from "@/lib/mockData";

export interface DepositRecord {
  id: string;
  riderId: string;
  riderName: string;
  storeId: string;
  storeName: string;
  amount: number;
  refNumber: string;
  slipImage?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  rejectionReason?: string;
}

interface AdminContextType {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  addOrder: (order: any) => void;
  stores: any[];
  setStores: React.Dispatch<React.SetStateAction<any[]>>;
  products: any[];
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  categories: any[];
  setCategories: React.Dispatch<React.SetStateAction<any[]>>;
  inventory: any[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
  riders: any[];
  setRiders: React.Dispatch<React.SetStateAction<any[]>>;
  customers: any[];
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  deposits: DepositRecord[];
  setDeposits: React.Dispatch<React.SetStateAction<DepositRecord[]>>;
  approveDeposit: (depositId: string) => void;
  rejectDeposit: (depositId: string, reason: string) => void;
  selectedStore: string;
  setSelectedStore: (storeId: string) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminContext = createContext<AdminContextType | null>(null);

function mapRawOrders(raw: any[]) {
  return raw.map((o: any) => ({
    ...o,
    orderStatus: o.orderStatus || o.status || "pending",
    orderNumber: o.orderNumber || o.id,
    total: o.total !== undefined ? o.total : (o.totalAmount || 0),
    subtotal: o.subtotal !== undefined ? o.subtotal : (o.itemsTotal || 0),
    deliveryFee: o.deliveryFee !== undefined ? o.deliveryFee : 250,
    discount: o.discount || 0,
    deliveryAddress: typeof o.deliveryAddress === "string" ? { street: o.deliveryAddress, city: "Batticaloa" } : o.deliveryAddress,
    items: (o.items || []).map((i: any) => ({
      ...i,
      productName: i.productName || i.name,
      quantity: i.quantity || i.qty || 1,
      unitPrice: i.unitPrice || i.price || 0,
      totalPrice: i.totalPrice || i.subtotal || ((i.unitPrice || i.price || 0) * (i.quantity || i.qty || 1)),
    })),
  }));
}

function initRidersData(): any[] {
  return ridersData.map((r: any) => {
    let cash = r.cashInHand;
    let cashAge = r.cashAgeHours || 0;
    let pending = Boolean(r.depositPending);

    if (r.id === "rdr-01") {
      cash = 11450; // Exceeds LKR 10,000 threshold
      cashAge = 2;
      pending = true;
    } else if (r.id === "rdr-02") {
      cash = 3500;
      cashAge = 1;
      pending = false;
    } else if (r.id === "rdr-03") {
      cash = 4200;
      cashAge = 5; // Exceeds 4 hours threshold
      pending = false;
    } else if (r.id === "rdr-04") {
      cash = 2100;
      cashAge = 1;
      pending = false;
    } else if (cash === undefined) {
      cash = r.status === "available" ? 3200 : 6800;
      cashAge = 1;
    }

    return {
      ...r,
      cashInHand: cash,
      cashAgeHours: cashAge,
      depositPending: pending,
      shiftStatus: r.shiftStatus || (r.status !== "offline" ? "active" : "offline"),
    };
  });
}

const defaultDeposits: DepositRecord[] = [
  {
    id: "DEP-90421",
    riderId: "rdr-01",
    riderName: "Kajan Sivanesan",
    storeId: "br-btc-01",
    storeName: "BuyMe Batticaloa Town",
    amount: 11450,
    refNumber: "BOC-DEP-772914",
    status: "pending",
    submittedAt: "2026-11-14T10:15:00.000Z",
  },
  {
    id: "DEP-89302",
    riderId: "rdr-03",
    riderName: "Mohamed Ahamed",
    storeId: "br-btc-02",
    storeName: "BuyMe Kattankudy",
    amount: 8500,
    refNumber: "COMB-SLIP-441029",
    status: "approved",
    submittedAt: "2026-11-14T08:30:00.000Z",
  },
];

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [selectedStore, setSelectedStore] = useState("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("buyme_orders");
        if (stored) return mapRawOrders(JSON.parse(stored));
      } catch (e) {}
    }
    return mapRawOrders(ordersData);
  });

  const [stores, setStores] = useState<any[]>(() =>
    storesData.map((b: any) => ({
      ...b,
      status: b.status || (b.isActive ? "active" : "inactive"),
    }))
  );

  const [products, setProducts] = useState<any[]>(() =>
    productsData.map((p: any) => ({
      ...p,
      tamilName: p.tamilName || p.nameTa || "",
      imageUrl: p.imageUrl || p.image || "/images/products/prod-001.svg",
    }))
  );

  const [categories, setCategories] = useState<any[]>(() =>
    categoriesData.map((c: any) => ({
      ...c,
      tamilName: c.tamilName || c.nameTa || "",
      icon: c.icon || "Package",
    }))
  );

  const [inventory, setInventory] = useState<any[]>(() =>
    inventoryData.map((inv: any) => ({
      ...inv,
      stockLevel: inv.stockLevel || inv.quantity || inv.stock || 0,
    }))
  );

  const [riders, setRiders] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("buyme_riders");
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return initRidersData();
  });

  const [customers, setCustomers] = useState<any[]>(() =>
    customersData.map((c: any) => ({
      ...c,
      totalOrders: c.totalOrders || 0,
      totalSpent: c.totalSpent || 0,
    }))
  );

  const [deposits, setDeposits] = useState<DepositRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("buyme_deposits");
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return defaultDeposits;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("buyme_orders", JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem("buyme_riders", JSON.stringify(riders));
    } catch (e) {}
  }, [riders]);

  useEffect(() => {
    try {
      localStorage.setItem("buyme_deposits", JSON.stringify(deposits));
    } catch (e) {}
  }, [deposits]);

  // Synchronize across tabs and storage events
  useEffect(() => {
    const handleOrdersUpdate = () => {
      try {
        const stored = localStorage.getItem("buyme_orders");
        if (stored) setOrders(mapRawOrders(JSON.parse(stored)));
      } catch (e) {}
    };

    const handleRidersUpdate = () => {
      try {
        const stored = localStorage.getItem("buyme_riders");
        if (stored) setRiders(JSON.parse(stored));
      } catch (e) {}
    };

    const handleDepositsUpdate = () => {
      try {
        const stored = localStorage.getItem("buyme_deposits");
        if (stored) setDeposits(JSON.parse(stored));
      } catch (e) {}
    };

    window.addEventListener("buyme_orders_updated", handleOrdersUpdate);
    window.addEventListener("buyme_riders_updated", handleRidersUpdate);
    window.addEventListener("buyme_deposits_updated", handleDepositsUpdate);
    window.addEventListener("storage", () => {
      handleOrdersUpdate();
      handleRidersUpdate();
      handleDepositsUpdate();
    });

    return () => {
      window.removeEventListener("buyme_orders_updated", handleOrdersUpdate);
      window.removeEventListener("buyme_riders_updated", handleRidersUpdate);
      window.removeEventListener("buyme_deposits_updated", handleDepositsUpdate);
    };
  }, []);

  const addOrder = (order: any) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      try {
        localStorage.setItem("buyme_orders", JSON.stringify(updated));
        window.dispatchEvent(new Event("buyme_orders_updated"));
      } catch (e) {}
      return updated;
    });
  };

  const approveDeposit = (depositId: string) => {
    setDeposits((prev) => {
      const target = prev.find((d) => d.id === depositId);
      if (!target) return prev;
      const updated = prev.map((d) =>
        d.id === depositId ? { ...d, status: "approved" as const } : d
      );
      try {
        localStorage.setItem("buyme_deposits", JSON.stringify(updated));
        window.dispatchEvent(new Event("buyme_deposits_updated"));
      } catch (e) {}

      // Deduct deposited amount from rider and unlock
      setRiders((rPrev) => {
        const rUpdated = rPrev.map((r) => {
          if (r.id === target.riderId) {
            const newCash = Math.max(0, (r.cashInHand || 0) - target.amount);
            return {
              ...r,
              cashInHand: newCash,
              cashAgeHours: 0,
              depositPending: false,
              status: "available",
            };
          }
          return r;
        });
        try {
          localStorage.setItem("buyme_riders", JSON.stringify(rUpdated));
          window.dispatchEvent(new Event("buyme_riders_updated"));
        } catch (e) {}
        return rUpdated;
      });

      return updated;
    });
  };

  const rejectDeposit = (depositId: string, reason: string) => {
    setDeposits((prev) => {
      const target = prev.find((d) => d.id === depositId);
      const updated = prev.map((d) =>
        d.id === depositId
          ? { ...d, status: "rejected" as const, rejectionReason: reason || "Verification failed" }
          : d
      );
      try {
        localStorage.setItem("buyme_deposits", JSON.stringify(updated));
        window.dispatchEvent(new Event("buyme_deposits_updated"));
      } catch (e) {}

      // Keep rider locked or clear pending flag so rider can re-submit
      if (target) {
        setRiders((rPrev) => {
          const rUpdated = rPrev.map((r) => {
            if (r.id === target.riderId) {
              return { ...r, depositPending: false };
            }
            return r;
          });
          try {
            localStorage.setItem("buyme_riders", JSON.stringify(rUpdated));
            window.dispatchEvent(new Event("buyme_riders_updated"));
          } catch (e) {}
          return rUpdated;
        });
      }

      return updated;
    });
  };

  return (
    <AdminContext.Provider
      value={{
        orders,
        setOrders,
        addOrder,
        stores,
        setStores,
        products,
        setProducts,
        categories,
        setCategories,
        inventory,
        setInventory,
        riders,
        setRiders,
        customers,
        setCustomers,
        deposits,
        setDeposits,
        approveDeposit,
        rejectDeposit,
        selectedStore,
        setSelectedStore,
        globalSearch,
        setGlobalSearch,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminData must be used inside AdminProvider");
  return ctx;
}
