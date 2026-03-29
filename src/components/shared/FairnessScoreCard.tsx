import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FairnessResult } from "@/types";

export function FairnessScoreCard({ fairness }: { fairness: FairnessResult }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_right,rgba(195,154,95,0.18),transparent_42%)]" />

      <div className="relative">
        <p className="section-kicker">Fairness Score</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-5xl font-semibold tracking-[-0.06em] text-ink">{fairness.score}</p>
          <span className="rounded-full border border-[#d8c6a7] bg-[#fbf3e5]/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#7f6a49]">
            Team wide
          </span>
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar value={fairness.score} />
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600">{fairness.explanation}</p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#e2d7c3] bg-white/60 p-3">
          <dt className="text-xs uppercase tracking-[0.22em] text-slate-500">Assigned balance</dt>
          <dd className="mt-2 text-xl font-semibold text-ink">{fairness.breakdown.assignedBalanceScore}</dd>
        </div>
        <div className="rounded-2xl border border-[#e2d7c3] bg-white/60 p-3">
          <dt className="text-xs uppercase tracking-[0.22em] text-slate-500">Completed balance</dt>
          <dd className="mt-2 text-xl font-semibold text-ink">{fairness.breakdown.completedBalanceScore}</dd>
        </div>
        <div className="rounded-2xl border border-[#e2d7c3] bg-white/60 p-3">
          <dt className="text-xs uppercase tracking-[0.22em] text-slate-500">Voting compliance</dt>
          <dd className="mt-2 text-xl font-semibold text-ink">{fairness.breakdown.votingComplianceScore}</dd>
        </div>
        <div className="rounded-2xl border border-[#e2d7c3] bg-white/60 p-3">
          <dt className="text-xs uppercase tracking-[0.22em] text-slate-500">Overdue penalty</dt>
          <dd className="mt-2 text-xl font-semibold text-ink">-{fairness.breakdown.overduePenalty}</dd>
        </div>
        <div className="rounded-2xl border border-[#e2d7c3] bg-white/60 p-3">
          <dt className="text-xs uppercase tracking-[0.22em] text-slate-500">Overload penalty</dt>
          <dd className="mt-2 text-xl font-semibold text-ink">-{fairness.breakdown.overloadPenalty}</dd>
        </div>
      </dl>
    </Card>
  );
}
