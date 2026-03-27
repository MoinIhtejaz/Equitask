import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FairnessResult } from "@/types";

export function FairnessScoreCard({ fairness }: { fairness: FairnessResult }) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm text-slate-500">Fairness Score</p>
        <p className="text-4xl font-bold text-ink">{fairness.score}</p>
      </div>

      <ProgressBar value={fairness.score} />

      <p className="text-sm text-slate-600">{fairness.explanation}</p>

      <dl className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <dt>Assigned balance</dt>
          <dd className="font-semibold">{fairness.breakdown.assignedBalanceScore}</dd>
        </div>
        <div>
          <dt>Completed balance</dt>
          <dd className="font-semibold">{fairness.breakdown.completedBalanceScore}</dd>
        </div>
        <div>
          <dt>Voting compliance</dt>
          <dd className="font-semibold">{fairness.breakdown.votingComplianceScore}</dd>
        </div>
        <div>
          <dt>Overdue penalty</dt>
          <dd className="font-semibold">-{fairness.breakdown.overduePenalty}</dd>
        </div>
      </dl>
    </Card>
  );
}
