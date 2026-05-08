"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getPasswordValidationError } from "@/lib/security/password";
import { getSecureCredentialOriginError } from "@/lib/security/secureOrigin";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const originError = getSecureCredentialOriginError();
      const passwordError = getPasswordValidationError(password);

      if (originError || passwordError) {
        setError(originError || passwordError);
        setMessage(null);
        return;
      }

      setIsBusy(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Sign-up failed.");
      }

      setMessage(payload.message || "Account created.");

      if (!payload.needsEmailVerification) {
        router.push(payload.redirectTo || "/dashboard");
        router.refresh();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Sign-up failed.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-ink">Create your Equitask account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create your account first, then join or manage your team from the Team page.
          </p>
        </div>

        {!SUPABASE_CONFIGURED ? (
          <p className="rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
            Supabase is not configured yet. Add the required environment variables before creating an account.
          </p>
        ) : null}

        {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-100 p-3 text-sm text-emerald-700">{message}</p> : null}

        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              type="text"
              placeholder="Your name"
              required
            />
          </div>

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
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          <Button className="w-full" disabled={isBusy || !SUPABASE_CONFIGURED}>
            {isBusy ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-storm underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
