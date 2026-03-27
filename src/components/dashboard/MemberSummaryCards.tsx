import Link from "next/link";

import { Avatar } from "@/components/shared/Avatar";
import { Card } from "@/components/ui/Card";
import { MemberSummary } from "@/services/memberService";

export function MemberSummaryCards({ summaries }: { summaries: MemberSummary[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaries.map((summary) => (
        <Link key={summary.member.id} href={`/members/${summary.member.id}`}>
          <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <Avatar member={summary.member} />
              <div>
                <p className="font-semibold text-slate-800">{summary.member.name}</p>
                <p className="text-xs text-slate-500">{summary.member.role}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Assigned</p>
                <p className="font-semibold text-ink">{summary.assignedTaskCount}</p>
              </div>
              <div>
                <p className="text-slate-500">Completed</p>
                <p className="font-semibold text-ink">{summary.completedTaskCount}</p>
              </div>
              <div>
                <p className="text-slate-500">Story points</p>
                <p className="font-semibold text-ink">{summary.assignedStoryPoints}</p>
              </div>
              <div>
                <p className="text-slate-500">Delivered</p>
                <p className="font-semibold text-ink">{summary.completedStoryPoints}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
