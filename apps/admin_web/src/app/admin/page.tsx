"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/overview");
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12">
      <span className="text-xs text-gray-400">Redirecting to Executive Overview...</span>
    </div>
  );
}
