import { BoardClient } from "@/components/board/BoardClient";
import { TaskComposer } from "@/components/tasks/TaskComposer";
import { Card } from "@/components/ui/Card";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function BoardPage() {
  const session = requireWorkspaceSession();
  const snapshot = await getWorkspaceSnapshot(session);

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Scrum Board</h1>
        <p className="mt-1 text-slate-600">
          Update task status and assignment while tracking voting readiness and workload fit.
        </p>
      </Card>

      <TaskComposer />

      <BoardClient
        tasks={snapshot.data.tasks}
        members={snapshot.data.members}
        votes={snapshot.data.votes}
      />
    </div>
  );
}
