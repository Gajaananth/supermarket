"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { AdminProvider } from "@/context/AdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(true);

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("buyme_session");
      if (!sessionStr) {
        setAuthorized(false);
        router.push("/login?redirect=/admin/overview");
        return;
      }
      const session = JSON.parse(sessionStr);
      if (session.role !== "main_admin" && session.role !== "store_admin") {
        setAuthorized(false);
        router.push("/unauthorized?required=admin");
        return;
      }
      setAuthorized(true);
    } catch (e) {
      setAuthorized(false);
      router.push("/login");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#FFFDFD] aurora-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E4002B] border-t-transparent animate-spin"></div>
          <span className="text-xs font-semibold text-gray-500">Checking credentials...</span>
        </div>
      </div>
    );
  }

  const handleResetData = () => {
    localStorage.removeItem("buyme_session");
    window.location.reload();
  };

  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-[#FFFDFD] aurora-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Demo Notice Banner */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs flex items-center justify-between text-amber-900 sticky top-0 z-30 backdrop-blur-md">
            <span className="font-medium text-[11px] sm:text-xs">
              ⚠️ <strong>DEMO</strong> — Simulated data, not live. Batticaloa District pilot (10 Hyperlocal Store Hubs).
            </span>
            <button
              onClick={handleResetData}
              className="text-[11px] font-bold text-amber-900 underline hover:text-[#E4002B] ml-2 shrink-0"
            >
              Reset demo data
            </button>
          </div>
          <TopNav />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
