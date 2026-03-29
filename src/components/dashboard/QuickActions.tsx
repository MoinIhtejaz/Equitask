import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const ACTIONS = [
  { href: "/board", title: "Open Scrum Board", text: "Move tasks, rebalance assignments, and keep delivery flowing.", tag: "Execution" },
  { href: "/voting", title: "Run Voting Session", text: "Close pending votes and reveal official effort only after the team aligns.", tag: "Planning" },
  { href: "/analytics", title: "Review Analytics", text: "Inspect contribution, risk, and fairness signals for the full team.", tag: "Insights" }
];

export function QuickActions() {
  return (
    <Card className="relative overflow-hidden">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="section-kicker">Command shortcuts</p>
          <h3 className="mt-3 text-2xl font-semibold text-ink">Quick Actions</h3>
        </div>
        <span className="rounded-full border border-[#e2d7c3] bg-white/[0.65] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          3 routes
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-[24px] border border-[#e3d8c6] bg-white/[0.65] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#c39a5f] hover:shadow-[0_26px_70px_-40px_rgba(17,20,26,0.45)]"
          >
            <Badge className="border-[#d9bf92] bg-[#f5e8ce] text-[#76562a]">{action.tag}</Badge>
            <p className="mt-4 text-lg font-semibold text-slate-800">{action.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{action.text}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
