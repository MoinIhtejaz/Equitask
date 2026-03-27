import { Card } from "@/components/ui/Card";
import { VotingPanel } from "@/components/voting/VotingPanel";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function VotingPage() {
  const session = requireWorkspaceSession();
  const snapshot = await getWorkspaceSnapshot(session);

  const votingTasks = snapshot.data.tasks
    .filter((task) => task.votingRequired)
    .sort((first, second) => Number(first.votingClosed) - Number(second.votingClosed));

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Story Point Voting Center</h1>
        <p className="mt-1 text-slate-600">
          Submit team estimates, surface disagreement, and lock official effort before assignment.
        </p>
      </Card>

      <div className="space-y-4">
        {votingTasks.map((task) => (
          <Card key={task.id} className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold text-ink">{task.title}</h2>
              <p className="text-sm text-slate-600">{task.description}</p>
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
