import React from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { AdminProvider } from "@/context/AdminContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="aurora-bg flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          <main className="w-full flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
