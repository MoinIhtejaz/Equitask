import { BoardClient } from "@/components/board/BoardClient";
import { FinalizeTeamPanel } from "@/components/dashboard/FinalizeTeamPanel";
import { TaskComposer } from "@/components/tasks/TaskComposer";
import { Card } from "@/components/ui/Card";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { listTeams } from "@/services/teamService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function BoardPage() {
  const session = requireWorkspaceSession();

  if (!session.teamId) {
    const teams = session.mode === "supabase" ? await listTeams(session) : [];

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
        </Card>

        <FinalizeTeamPanel teams={teams} />
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

      <TaskComposer />

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
