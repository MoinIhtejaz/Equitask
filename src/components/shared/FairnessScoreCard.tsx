import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FairnessResult } from "@/types";

export function FairnessScoreCard({ fairness }: { fairness: FairnessResult }) {
  return (
    <Card>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fairness</p>
          <p className="mt-1 text-3xl font-semibold text-ink">{fairness.score}</p>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar value={fairness.score} />
      </div>

      <p className="mt-3 text-sm text-slate-600">{fairness.explanation}</p>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Assigned balance</dt>
          <dd className="font-medium text-ink">{fairness.breakdown.assignedBalanceScore}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Completed balance</dt>
          <dd className="font-medium text-ink">{fairness.breakdown.completedBalanceScore}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Voting compliance</dt>
          <dd className="font-medium text-ink">{fairness.breakdown.votingComplianceScore}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Overdue penalty</dt>
          <dd className="font-medium text-ink">-{fairness.breakdown.overduePenalty}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Overload penalty</dt>
          <dd className="font-medium text-ink">-{fairness.breakdown.overloadPenalty}</dd>
        </div>
      </dl>
    </Card>
  );
}
