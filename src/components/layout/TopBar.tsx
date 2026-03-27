"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { SessionUser } from "@/types";

export function TopBar({ session }: { session: SessionUser }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function onSignOut() {
    try {
      setIsSigningOut(true);
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Workspace</p>
          <h2 className="text-xl font-semibold text-ink">Equitask Command Center</h2>
          {session.teamName ? (
            <p className="mt-1 text-sm text-slate-600">
              {session.teamName}
              {session.projectName ? ` • ${session.projectName}` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/teams"
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Team Hub
          </Link>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {session.mode === "demo" ? "Demo mode" : "Supabase mode"}
          </span>
          <Button variant="ghost" onClick={onSignOut} disabled={isSigningOut}>
            {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </div>
    </header>
  );
}
