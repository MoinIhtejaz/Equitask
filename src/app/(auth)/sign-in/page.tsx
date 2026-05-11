"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getPasswordValidationError } from "@/lib/security/password";
import { getSecureCredentialOriginError } from "@/lib/security/secureOrigin";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const transitionSteps = ["Verifying your account", "Loading team workspace", "Opening dashboard"];

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  useEffect(() => {
    if (!isBusy) {
      setLoadingStep(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingStep((current) => (current + 1) % transitionSteps.length);
    }, 900);

    return () => window.clearInterval(interval);
  }, [isBusy, transitionSteps.length]);

  async function onDemoLogin() {
    try {
      setIsBusy(true);
      setError(null);
      const response = await fetch("/api/auth/demo", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Demo login failed.");
      window.location.assign(payload.redirectTo || "/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Demo login failed.");
      setIsBusy(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const originError = getSecureCredentialOriginError();
      const passwordError = getPasswordValidationError(password);

      if (originError || passwordError) {
        setError(originError || passwordError);
        return;
      }

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
      window.location.assign(redirectTo);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Sign-in failed.");
      setIsBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      {isBusy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-4 text-sm text-slate-700 shadow-lg">
            {transitionSteps[loadingStep]}…
          </div>
        </div>
      ) : null}

      <Card className="w-full max-w-md space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-ink">Sign in to Equitask</h1>
          <p className="mt-1 text-sm text-slate-500">Continue with your Supabase account.</p>
        </div>

        {!SUPABASE_CONFIGURED ? (
          <p className="rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
            Supabase is not configured yet. Add the required environment variables before signing in.
          </p>
        ) : null}

        {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

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

        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={onDemoLogin}
          disabled={isBusy}
          className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
        >
          Continue with Demo (no account needed)
        </button>
      </Card>
    </main>
  );
}
