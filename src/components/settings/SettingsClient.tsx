"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export function SettingsClient({ canUseSupabase }: { canUseSupabase: boolean }) {
  const router = useRouter();
  const [busyAction, setBusyAction] = useState<"demo" | "signout" | null>(null);

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

  async function signOut() {
    try {
      setBusyAction("signout");
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
      router.refresh();
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary" onClick={() => router.push("/teams")} disabled={busyAction !== null}>
        Open Team Hub
      </Button>

      <Button variant="secondary" onClick={switchToDemo} disabled={busyAction !== null}>
        {busyAction === "demo" ? "Switching..." : "Switch to Demo Mode"}
      </Button>

      <Button variant="ghost" onClick={signOut} disabled={busyAction !== null}>
        {busyAction === "signout" ? "Signing out..." : "Sign Out"}
      </Button>

      {!canUseSupabase ? (
        <p className="w-full rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
          Supabase credentials are not configured. Demo mode remains fully operational.
        </p>
      ) : null}
    </div>
  );
}
