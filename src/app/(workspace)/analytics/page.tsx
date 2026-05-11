import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { FairnessScoreCard } from "@/components/shared/FairnessScoreCard";
import { Card } from "@/components/ui/Card";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { buildAnalyticsSnapshot } from "@/services/analyticsService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";
import Link from "next/link";

export default async function AnalyticsPage() {
  const session = requireWorkspaceSession();

  if (!session.teamId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-ink">Team Analytics</h1>
        <p className="text-sm text-slate-600">Join your team first to load analytics.</p>
        <Link
          href="/teams"
          className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"
        >
          Open Team Management
        </Link>
      </div>
    );
  }

  const snapshot = await getWorkspaceSnapshot(session);

  const analytics = buildAnalyticsSnapshot(
    snapshot.data.tasks,
    snapshot.data.members,
    snapshot.data.votes,
    snapshot.fairness
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">Team Analytics</h1>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <AnalyticsCharts analytics={analytics} />
        <div className="space-y-4">
          <FairnessScoreCard fairness={snapshot.fairness} />
          <Card>
            <h3 className="text-base font-semibold text-ink">Delivery risk</h3>
            <p className="mt-1 text-sm text-slate-600">
              Deadline risk level: <span className="font-medium text-ink">{analytics.deadlineRisk}</span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
