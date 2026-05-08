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
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.45fr,0.85fr]">
          <div className="lux-surface relative overflow-hidden rounded-[32px] px-6 py-7 sm:px-8">
            <div className="absolute inset-y-0 right-0 w-60 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.18),transparent_70%)]" />
            <p className="section-kicker">Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-ink">Welcome to Equitask</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Your account is ready, but your team is not finalized yet. Once you connect to a team,
              this space becomes the shared command center for analytics, voting, notifications, and scrum work.
            </p>
            <Link
              href="/teams"
              className="mt-5 inline-flex rounded-2xl border border-[#d5b786] bg-[linear-gradient(135deg,#f6e9cb_0%,#e8c98e_100%)] px-4 py-3 text-sm font-semibold text-ink shadow-[0_16px_36px_-24px_rgba(195,154,95,0.85)] transition hover:-translate-y-0.5 hover:brightness-[1.03]"
            >
              Open Team Management
            </Link>
          </div>

          <div className="lux-surface rounded-[32px] px-6 py-7">
            <p className="section-kicker">Next move</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Attach yourself to a team</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Team analytics are calculated at the team level, not per user. Open Team Management to create or join
              the shared workspace, then the full product activates automatically.
            </p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Team Status" value="Pending" caption="No team attached yet" />
          <SummaryCard label="Analytics Scope" value="Team" caption="Not individual-only" />
          <SummaryCard label="Voting Flow" value="Ready" caption="Hidden until all votes finish" />
          <SummaryCard label="Next Step" value="Team" caption="Open Team Management" />
        </div>
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
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.4fr,0.9fr]">
        <div className="lux-surface relative overflow-hidden rounded-[32px] px-6 py-7 sm:px-8">
          <div className="absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.18),transparent_72%)]" />
          <p className="section-kicker">Active Team</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-ink">{snapshot.data.team.name}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Project: {snapshot.data.team.projectName}. Monitor delivery, spot imbalance early, and keep the team
            aligned from task intake through board execution.
          </p>
        </div>

        <div className="lux-surface rounded-[32px] px-6 py-7">
          <p className="section-kicker">Workspace Readiness</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">
            {snapshot.pendingVotesCount > 0 ? "Votes still in flight" : "Board ready for execution"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {snapshot.pendingVotesCount > 0
              ? `${snapshot.pendingVotesCount} task${snapshot.pendingVotesCount === 1 ? "" : "s"} still need team voting before assignment can fully stabilize.`
              : "All currently visible board work has cleared voting and is ready to move through the scrum workflow."}
          </p>
        </div>
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
