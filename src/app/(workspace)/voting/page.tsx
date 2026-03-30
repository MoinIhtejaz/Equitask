import { Card } from "@/components/ui/Card";
import { FinalizeTeamPanel } from "@/components/dashboard/FinalizeTeamPanel";
import { VotingPanel } from "@/components/voting/VotingPanel";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { listTeams } from "@/services/teamService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function VotingPage() {
  const session = requireWorkspaceSession();

  if (!session.teamId) {
    const teams = session.mode === "supabase" ? await listTeams(session) : [];

    return (
      <div className="space-y-5">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_68%)]" />
          <p className="section-kicker">Voting queue</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Story Point Voting Center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Attach yourself to a team first, then the private voting queue will load for the shared workspace.
          </p>
        </Card>

        <FinalizeTeamPanel teams={teams} />
      </div>
    );
  }

  const snapshot = await getWorkspaceSnapshot(session);

  const votingTasks = snapshot.data.tasks
    .filter((task) => task.votingRequired && !task.votingClosed)
    .sort((first, second) => Number(first.votingClosed) - Number(second.votingClosed));

  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_68%)]" />
        <p className="section-kicker">Voting queue</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Story Point Voting Center</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Submit team estimates, surface disagreement, and lock official effort before assignment.
        </p>
      </Card>

      {votingTasks.length === 0 ? (
        <Card>
          <h2 className="text-2xl font-semibold text-ink">No active votes right now</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Once a task reaches 4/4 votes it leaves this page and moves into the scrum board backlog.
          </p>
        </Card>
      ) : null}

      <div className="space-y-4">
        {votingTasks.map((task) => (
          <Card key={task.id} className="space-y-4">
            <div>
              <p className="section-kicker">Task in voting</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">{task.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p>
            </div>

            <VotingPanel
              task={task}
              members={snapshot.data.members}
              votes={snapshot.data.votes.filter((vote) => vote.taskId === task.id)}
              currentUserId={session.id}
              mode={session.mode}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
