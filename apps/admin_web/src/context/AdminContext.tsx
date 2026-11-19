"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

export interface AdminSessionUser {
  id: string;
  role: "SUPER_ADMIN" | "STORE_ADMIN";
  fullName: string;
  email: string | null;
  phone: string | null;
  store: { id: string; code: string; name: string } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAdminSessionUser(value: unknown): AdminSessionUser | null {
  if (!isRecord(value)) return null;
  const record = value;
  if (
    typeof record.id !== "string" ||
    typeof record.fullName !== "string" ||
    (record.role !== "SUPER_ADMIN" && record.role !== "STORE_ADMIN")
  ) {
    return null;
  }

  let store: AdminSessionUser["store"] = null;
  if (record.role === "STORE_ADMIN") {
    if (
      typeof record.store !== "object" ||
      record.store === null ||
      !("id" in record.store) ||
      typeof record.store.id !== "string" ||
      !("code" in record.store) ||
      typeof record.store.code !== "string" ||
      !("name" in record.store) ||
      typeof record.store.name !== "string"
    ) {
      return null;
    }
    store = { id: record.store.id, code: record.store.code, name: record.store.name };
  }

  return {
    id: record.id,
    role: record.role,
    fullName: record.fullName,
    email: typeof record.email === "string" ? record.email : null,
    phone: typeof record.phone === "string" ? record.phone : null,
    store,
  };
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
  setGlobalSearch: (query: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sessionUser: AdminSessionUser | null;
  sessionLoading: boolean;
  sessionError: string;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [globalSearch, setGlobalSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<AdminSessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!response.ok) {
          if (active && response.status !== 401 && response.status !== 403) {
            setSessionError("Could not verify the current session.");
          }
          return;
        }
        const body: unknown = await response.json();
        if (typeof body !== "object" || body === null || !("user" in body)) {
          throw new Error("The session endpoint returned an invalid profile.");
        }
        const user = parseAdminSessionUser(body.user);
        if (!user) throw new Error("The session endpoint returned an invalid admin profile.");
        if (active) setSessionUser(user);
      } catch (error) {
        if (active) {
          setSessionError(error instanceof Error ? error.message : "Could not verify the current session.");
        }
      } finally {
        if (active) setSessionLoading(false);
      }
    };
    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  const notAvailable = () => {
    throw new Error("This operation is not available in the Super Admin gate.");
  };

  return (
    <AdminContext.Provider
      value={{
        orders,
        setOrders,
        addOrder: (order) => setOrders((current) => [order, ...current]),
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
        approveDeposit: notAvailable,
        rejectDeposit: notAvailable,
        selectedStore,
        setSelectedStore,
        globalSearch,
        setGlobalSearch,
        isSidebarOpen,
        setIsSidebarOpen,
        sessionUser,
        sessionLoading,
        sessionError,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminData must be used inside AdminProvider");
  return context;
}
