import React from "react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFD] aurora-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-surface-elevated max-w-md w-full p-8 rounded-3xl border border-white/80 shadow-xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black shadow-md border border-amber-200">
          403
        </div>
        <h1 className="text-2xl font-extrabold text-[#1F2430]">Access Denied</h1>
        <p className="text-sm text-[#6B7280]">
          You do not have the required permissions to view this portal. Please sign in with an authorized account.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full py-3 bg-[#E4002B] hover:bg-[#B80022] text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all"
          >
            Switch Account / Sign In
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
