import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { FairnessScoreCard } from "@/components/shared/FairnessScoreCard";
import { Card } from "@/components/ui/Card";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { buildAnalyticsSnapshot } from "@/services/analyticsService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function AnalyticsPage() {
  const session = requireWorkspaceSession();
  const snapshot = await getWorkspaceSnapshot(session);

  const analytics = buildAnalyticsSnapshot(
    snapshot.data.tasks,
    snapshot.data.members,
    snapshot.data.votes,
    snapshot.fairness
  );

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Team Analytics</h1>
        <p className="mt-1 text-slate-600">
          Explore contribution, workload distribution, project progress, voting alignment, and risk.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <AnalyticsCharts analytics={analytics} />
        <div className="space-y-4">
          <FairnessScoreCard fairness={snapshot.fairness} />
          <Card>
            <h3 className="mb-2 text-lg font-semibold text-ink">Risk Snapshot</h3>
            <p className="text-sm text-slate-600">Deadline risk level: {analytics.deadlineRisk}</p>
            <p className="mt-2 text-sm text-slate-600">
              Voting agreement chart and workload distribution update from the active dataset.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
