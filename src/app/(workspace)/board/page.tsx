import Link from "next/link";

import { BoardClient } from "@/components/board/BoardClient";
import { Card } from "@/components/ui/Card";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function BoardPage() {
  const session = requireWorkspaceSession();

  if (!session.teamId) {
    return (
      <div className="space-y-5">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_68%)]" />
          <p className="section-kicker">Execution board</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Scrum Board</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Join your team first, then this board will load the shared workflow for backlog, to do, in progress,
            review, and done.
          </p>
          <Link
            href="/teams"
            className="mt-5 inline-flex rounded-2xl border border-[#d5b786] bg-[linear-gradient(135deg,#f6e9cb_0%,#e8c98e_100%)] px-4 py-3 text-sm font-semibold text-ink shadow-[0_16px_36px_-24px_rgba(195,154,95,0.85)] transition hover:-translate-y-0.5 hover:brightness-[1.03]"
          >
            Open Team Management
          </Link>
        </Card>
      </div>
    );
  }

  const snapshot = await getWorkspaceSnapshot(session);

  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_68%)]" />
        <p className="section-kicker">Execution board</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">Scrum Board</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          Drag tasks between columns to move work forward, then assign owners without the extra board clutter.
        </p>
      </Card>

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
