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
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-wide text-slate-500">Active Team</p>
        <h1 className="text-2xl font-bold text-ink">{snapshot.data.team.name}</h1>
        <p className="text-slate-600">Project: {snapshot.data.team.projectName}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Total Tasks" value={snapshot.data.tasks.length} />
        <SummaryCard label="Completed Tasks" value={completedTasks} caption={`${completionRate}% done`} />
        <SummaryCard label="Pending Votes" value={snapshot.pendingVotesCount} />
        <SummaryCard label="Overdue Tasks" value={snapshot.overdueCount} />
        <SummaryCard label="Fairness Score" value={snapshot.fairness.score} />
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
