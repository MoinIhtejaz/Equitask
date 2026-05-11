import Link from "next/link";

import { Avatar } from "@/components/shared/Avatar";
import { Card } from "@/components/ui/Card";
import { MemberSummary } from "@/services/memberService";

export function MemberSummaryCards({ summaries }: { summaries: MemberSummary[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {summaries.map((summary) => (
        <Link key={summary.member.id} href={`/members/${summary.member.id}`} className="block">
          <Card className="h-full hover:border-slate-300">
            <div className="flex items-center gap-3">
              <Avatar member={summary.member} />
              <div>
                <p className="text-sm font-semibold text-ink">{summary.member.name}</p>
                <p className="text-xs text-slate-500">{summary.member.role}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-slate-500">Assigned</p>
                <p className="font-medium text-ink">{summary.assignedTaskCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="font-medium text-ink">{summary.completedTaskCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Points</p>
                <p className="font-medium text-ink">{summary.assignedStoryPoints}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Delivered</p>
                <p className="font-medium text-ink">{summary.completedStoryPoints}</p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
