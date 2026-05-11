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
        <Card className="border-dashed">
          <h2 className="text-base font-semibold text-ink">Join a team to create tasks</h2>
          <p className="mt-1 text-sm text-slate-600">
            Task creation unlocks once your account is attached to a team.
          </p>
        </Card>
      )}
    </div>
  );
}
