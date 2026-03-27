import Link from "next/link";

import { SessionUser } from "@/types";
import { APP_NAME } from "@/lib/constants";

const LINKS = [
  { href: "/teams", label: "Team Hub" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/board", label: "Scrum Board" },
  { href: "/voting", label: "Voting" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" }
];

export function Sidebar({ session }: { session: SessionUser }) {
  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{APP_NAME}</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Fair Team Delivery</h1>
      </div>

      <nav className="mt-8 space-y-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Signed in as {session.name}</p>
        <p className="mt-1">Mode: {session.mode === "demo" ? "Demo" : "Supabase"}</p>
      </div>
    </aside>
  );
}
