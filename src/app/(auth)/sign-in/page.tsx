"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function demoLogin() {
    try {
      setIsBusy(true);
      setError(null);
      await fetch("/api/auth/demo", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Demo login failed. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsBusy(true);
      setError(null);

      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Sign-in failed.");
      }

      const redirectTo = payload.redirectTo || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Sign-in failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sign in to Equitask</h1>
          <p className="mt-1 text-sm text-slate-500">Continue with demo mode or Supabase auth.</p>
        </div>

        {!SUPABASE_CONFIGURED ? (
          <p className="rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
            Supabase is not configured yet. Demo mode is available now.
          </p>
        ) : null}

        {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

        <Button variant="secondary" className="w-full" onClick={demoLogin} disabled={isBusy}>
          Demo Login
        </Button>

        <div className="relative py-1 text-center text-xs text-slate-400">
          <span className="bg-white px-2">or sign in with email</span>
          <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-slate-200" />
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button className="w-full" disabled={isBusy || !SUPABASE_CONFIGURED}>
            {isBusy ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          New to Equitask?{" "}
          <Link href="/sign-up" className="font-semibold text-storm underline">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}
