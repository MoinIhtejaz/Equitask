import Link from "next/link";

import { Avatar } from "@/components/shared/Avatar";
import { Card } from "@/components/ui/Card";
import { MemberSummary } from "@/services/memberService";

export function MemberSummaryCards({ summaries }: { summaries: MemberSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaries.map((summary) => (
        <Link key={summary.member.id} href={`/members/${summary.member.id}`} className="block">
          <Card className="relative h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_-40px_rgba(17,20,26,0.45)]">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(195,154,95,0.18),transparent_68%)]" />
            <div className="flex items-center gap-3">
              <Avatar member={summary.member} />
              <div>
                <p className="text-lg font-semibold text-slate-800">{summary.member.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{summary.member.role}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-[#e6dbc8] bg-white/60 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Assigned</p>
                <p className="mt-2 text-xl font-semibold text-ink">{summary.assignedTaskCount}</p>
              </div>
              <div className="rounded-2xl border border-[#e6dbc8] bg-white/60 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Completed</p>
                <p className="mt-2 text-xl font-semibold text-ink">{summary.completedTaskCount}</p>
              </div>
              <div className="rounded-2xl border border-[#e6dbc8] bg-white/60 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Story points</p>
                <p className="mt-2 text-xl font-semibold text-ink">{summary.assignedStoryPoints}</p>
              </div>
              <div className="rounded-2xl border border-[#e6dbc8] bg-white/60 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Delivered</p>
                <p className="mt-2 text-xl font-semibold text-ink">{summary.completedStoryPoints}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
