"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function SettingsClient({ canUseSupabase }: { canUseSupabase: boolean }) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"demo" | null>(null);

  async function switchToDemo() {
    try {
      setBusyAction("demo");
      await fetch("/api/auth/demo", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={switchToDemo} disabled={busyAction !== null}>
        {busyAction === "demo" ? "Switching..." : "Switch to Demo Mode"}
      </Button>

      {!canUseSupabase ? (
        <p className="w-full rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
          Supabase credentials are not configured. Demo mode remains fully operational.
        </p>
      ) : (
        <p className="w-full rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          Sign-out and account actions now live in the fixed account control at the bottom of the sidebar.
        </p>
      )}
    </div>
  );
}
