import { notFound } from "next/navigation";

import { AvailabilityGrid } from "@/components/members/AvailabilityGrid";
import { Avatar } from "@/components/shared/Avatar";
import { Card } from "@/components/ui/Card";
import { requireTeamSession } from "@/lib/auth/guards";
import { buildMemberSummaries } from "@/services/memberService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function MemberProfilePage({ params }: { params: { memberId: string } }) {
  const session = requireTeamSession();
  const snapshot = await getWorkspaceSnapshot(session);

  const member = snapshot.data.members.find((candidate) => candidate.id === params.memberId);
  if (!member) {
    notFound();
  }

  const summary = buildMemberSummaries(snapshot.data.members, snapshot.data.tasks).find(
    (candidate) => candidate.member.id === member.id
  );

  const recentActivity = snapshot.activityFeed.filter((event) => event.memberId === member.id).slice(0, 6);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar member={member} />
          <div>
            <h1 className="text-2xl font-bold text-ink">{member.name}</h1>
            <p className="text-slate-600">{member.role}</p>
          </div>
        </div>

        <p className="mt-3 text-slate-600">{member.bio}</p>
        <p className="mt-2 text-sm text-slate-600">
          Preferred working style: <span className="font-semibold">{member.preferredWorkingStyle}</span>
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Assigned Tasks</p>
          <p className="text-2xl font-bold text-ink">{summary?.assignedTaskCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Completed Tasks</p>
          <p className="text-2xl font-bold text-ink">{summary?.completedTaskCount ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Current Workload</p>
          <p className="text-2xl font-bold text-ink">{summary?.assignedStoryPoints ?? 0} pts</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Reliability</p>
          <p className="text-2xl font-bold text-ink">{member.reliabilityScore}%</p>
        </Card>
      </div>

      <AvailabilityGrid member={member} />

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-ink">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity.map((event) => (
            <p key={event.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
              {event.message}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
