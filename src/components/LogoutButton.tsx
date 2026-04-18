"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-bold text-white transition-all hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
    >
      {loading ? "LOGGING OUT..." : "LOGOUT"}
    </button>
  );
}
