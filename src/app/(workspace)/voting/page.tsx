import { VotingQueue } from "@/components/voting/VotingQueue";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { getWorkspaceSnapshot } from "@/services/workspaceService";
import Link from "next/link";

export default async function VotingPage() {
  const session = requireWorkspaceSession();

  if (!session.teamId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-ink">Story Point Voting</h1>
        <p className="text-sm text-slate-600">
          Attach yourself to a team first to load the voting queue.
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

  const votingTasks = snapshot.data.tasks
    .filter((task) => task.votingRequired && !task.votingClosed)
    .sort((first, second) => Number(first.votingClosed) - Number(second.votingClosed));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">Story Point Voting</h1>

      <VotingQueue
        tasks={votingTasks}
        members={snapshot.data.members}
        votes={snapshot.data.votes}
        currentUserId={session.id}
        mode={session.mode}
      />
    </div>
  );
}
