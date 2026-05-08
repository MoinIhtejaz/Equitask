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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090b0f]/80 px-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(195,154,95,0.16),transparent_32%),linear-gradient(180deg,#151a22_0%,#0f1319_100%)] p-8 text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.95)]">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#d6ba87]">Equitask</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#fff7e8]">Signing you in</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{transitionSteps[loadingStep]}</p>

            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#c39a5f_0%,#f0d7a2_50%,#c39a5f_100%)] transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / transitionSteps.length) * 100}%` }}
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-[#d6ba87]/25 border-t-[#f0d7a2]" />
              <p className="text-sm text-white/58">This usually only takes a moment.</p>
            </div>
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
      </Card>
    </main>
  );
}
