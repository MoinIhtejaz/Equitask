import Link from "next/link";

import { BoardClient } from "@/components/board/BoardClient";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function BoardPage() {
  const session = requireWorkspaceSession();

  if (!session.teamId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-ink">Scrum Board</h1>
        <p className="text-sm text-slate-600">
          Join your team first to load the shared board.
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

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-ink">Scrum Board</h1>

      <BoardClient
        tasks={snapshot.data.tasks}
        members={snapshot.data.members}
        votes={snapshot.data.votes}
        comments={snapshot.data.comments}
        currentUserId={session.id}
        mode={session.mode}
      />
    </div>
  );
}
