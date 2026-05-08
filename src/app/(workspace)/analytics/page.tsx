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
      <div className="space-y-5">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_68%)]" />
          <p className="section-kicker">Team intelligence</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Team Analytics</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Join your team first, then analytics will load contribution, workload, and progress for the whole group.
          </p>
          <Link
            href="/teams"
            className="mt-5 inline-flex rounded-2xl border border-[#d5b786] bg-[linear-gradient(135deg,#f6e9cb_0%,#e8c98e_100%)] px-4 py-3 text-sm font-semibold text-ink shadow-[0_16px_36px_-24px_rgba(195,154,95,0.85)] transition hover:-translate-y-0.5 hover:brightness-[1.03]"
          >
            Open Team Management
          </Link>
        </Card>
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
      <Card className="relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_68%)]" />
        <p className="section-kicker">Team intelligence</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Team Analytics</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Explore contribution, workload distribution, project progress, voting alignment, and risk.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <AnalyticsCharts analytics={analytics} />
        <div className="space-y-4">
          <FairnessScoreCard fairness={snapshot.fairness} />
          <Card>
            <p className="section-kicker">Risk snapshot</p>
            <h3 className="mt-3 text-2xl font-semibold text-ink">Delivery risk</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">Deadline risk level: {analytics.deadlineRisk}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Voting agreement chart and workload distribution update from the active dataset.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
