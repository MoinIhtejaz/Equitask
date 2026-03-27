import Link from "next/link";

import { Card } from "@/components/ui/Card";

const ACTIONS = [
  { href: "/teams", title: "Manage Team Hub", text: "Create a team, share code, or switch workspace." },
  { href: "/board", title: "Open Scrum Board", text: "Move tasks and rebalance assignments." },
  { href: "/voting", title: "Run Voting Session", text: "Close pending votes and align effort estimates." },
  { href: "/analytics", title: "Review Analytics", text: "Inspect contribution, risk, and fairness trends." }
];

export function QuickActions() {
  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-ink">Quick Actions</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-xl border border-slate-200 p-3 transition hover:border-storm/40 hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-800">{action.title}</p>
            <p className="mt-1 text-sm text-slate-500">{action.text}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
