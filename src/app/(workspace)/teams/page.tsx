import { TaskComposer } from "@/components/tasks/TaskComposer";
import { TeamManagementClient } from "@/components/teams/TeamManagementClient";
import { Card } from "@/components/ui/Card";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { listTeams } from "@/services/teamService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const session = requireWorkspaceSession();
  const teams = await listTeams(session);
  const snapshot = session.teamId ? await getWorkspaceSnapshot(session) : null;

  return (
    <div className="space-y-5">
      <TeamManagementClient
        teams={teams}
        members={snapshot?.data.members ?? []}
        activeTeamId={session.teamId}
        activeTeamName={session.teamName}
        activeProjectName={session.projectName}
      />

      {session.teamId ? (
        <TaskComposer />
      ) : (
        <Card className="border-dashed border-[#c39a5f]/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,242,228,0.9))]">
          <p className="section-kicker">Task Intake Locked</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Join a team to launch tasks</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Task creation is managed from this Team page, but it unlocks only after your account is attached to a
            team workspace.
          </p>
        </Card>
      )}
    </div>
  );
}
