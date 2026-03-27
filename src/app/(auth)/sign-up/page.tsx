"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamAction, setTeamAction] = useState<"create" | "join" | "later">("create");
  const [teamName, setTeamName] = useState("Team Equitask Alpha");
  const [projectName, setProjectName] = useState("Equitask Student Collaboration Platform");
  const [teamCode, setTeamCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsBusy(true);
      setError(null);
      setMessage(null);
      setWarning(null);

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          teamAction,
          teamName,
          projectName,
          teamCode
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Sign-up failed.");
      }

      setMessage(payload.message || "Account created.");
      if (payload.teamWarning) {
        setWarning(payload.teamWarning);
      }

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
          <p className="mt-1 text-sm text-slate-500">Enable persistent teamwork with Supabase auth.</p>
        </div>

        {!SUPABASE_CONFIGURED ? (
          <p className="rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
            Supabase is not configured yet. Add env vars first, or use demo mode from sign-in.
          </p>
        ) : null}

        {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-100 p-3 text-sm text-emerald-700">{message}</p> : null}
        {warning ? <p className="rounded-xl bg-amber-100 p-3 text-sm text-amber-800">{warning}</p> : null}

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

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Team setup
            </label>
            <Select
              value={teamAction}
              onChange={(event) => setTeamAction(event.target.value as "create" | "join" | "later")}
            >
              <option value="create">Create a new team</option>
              <option value="join">Join with team code</option>
              <option value="later">Decide after sign-up</option>
            </Select>
          </div>

          {teamAction === "create" ? (
            <div className="grid gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Team name
                </label>
                <Input
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  type="text"
                  placeholder="Team Equitask Alpha"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Project name
                </label>
                <Input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  type="text"
                  placeholder="Equitask Student Collaboration Platform"
                  required
                />
              </div>
            </div>
          ) : null}

          {teamAction === "join" ? (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Team code
              </label>
              <Input
                value={teamCode}
                onChange={(event) => setTeamCode(event.target.value)}
                type="text"
                placeholder="team-xxxxxx"
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                Ask your teammate to share the code from their Team Hub.
              </p>
            </div>
          ) : null}

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
