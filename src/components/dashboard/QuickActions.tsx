import Link from "next/link";

import { Card } from "@/components/ui/Card";

const ACTIONS = [
  { href: "/teams", title: "Manage Team" },
  { href: "/board", title: "Open Scrum Board" },
  { href: "/voting", title: "Run Voting" },
  { href: "/analytics", title: "Review Analytics" }
];

export function QuickActions() {
  return (
    <Card>
      <h3 className="text-base font-semibold text-ink">Quick Actions</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"
          >
            {action.title}
          </Link>
        ))}
      </div>
    </Card>
  );
}
