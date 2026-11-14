import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDFD] aurora-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-surface-elevated max-w-md w-full p-8 rounded-3xl border border-white/80 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E4002B] flex items-center justify-center mx-auto text-2xl font-black shadow-md border border-red-200">
          404
        </div>
        <h1 className="text-2xl font-extrabold text-[#1F2430]">Page Not Found</h1>
        <p className="text-sm text-[#6B7280]">
          The requested page or route does not exist in the BuyMe Batticaloa ecosystem.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full py-3 bg-[#E4002B] hover:bg-[#B80022] text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all"
          >
            Return to Platform Home
          </Link>
          <Link
            href="/admin/overview"
            className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
