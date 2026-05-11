import Link from "next/link";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { MemberSummaryCards } from "@/components/dashboard/MemberSummaryCards";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FairnessScoreCard } from "@/components/shared/FairnessScoreCard";
import { NotificationList } from "@/components/shared/NotificationList";
import { SummaryCard } from "@/components/shared/SummaryCard";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { buildAnalyticsSnapshot } from "@/services/analyticsService";
import { buildMemberSummaries } from "@/services/memberService";
import { getTaskCompletionPercentage } from "@/services/taskService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function DashboardPage() {
  const session = requireWorkspaceSession();

  if (!session.teamId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-ink">Welcome to Equitask</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Your account is ready, but you haven't joined a team yet. Analytics are calculated at the
          team level — attach yourself to a team to activate the workspace.
        </p>
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

  const memberSummaries = buildMemberSummaries(snapshot.data.members, snapshot.data.tasks);

  const completedTasks = snapshot.data.tasks.filter((task) => task.status === "done").length;
  const completionRate = getTaskCompletionPercentage(snapshot.data.tasks);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{snapshot.data.team.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {snapshot.data.team.projectName}
          {snapshot.pendingVotesCount > 0
            ? ` • ${snapshot.pendingVotesCount} task${snapshot.pendingVotesCount === 1 ? "" : "s"} awaiting votes`
            : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total Tasks" value={snapshot.data.tasks.length} />
        <SummaryCard label="Completed" value={completedTasks} caption={`${completionRate}% done`} />
        <SummaryCard label="Pending Votes" value={snapshot.pendingVotesCount} />
        <SummaryCard label="Overdue" value={snapshot.overdueCount} />
        <SummaryCard label="Fairness" value={snapshot.fairness.score} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <ProgressChart data={analytics.progressOverTime} />
        <FairnessScoreCard fairness={snapshot.fairness} />
      </div>

      <QuickActions />

      <MemberSummaryCards summaries={memberSummaries} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ActivityFeed events={snapshot.activityFeed} members={snapshot.data.members} />
        <NotificationList notifications={snapshot.data.notifications} />
      </div>
    </div>
  );
}
