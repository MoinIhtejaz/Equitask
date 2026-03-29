import { notFound } from "next/navigation";

import { TaskDetailClient } from "@/components/shared/TaskDetailClient";
import { requireTeamSession } from "@/lib/auth/guards";
import { recommendAssignees } from "@/services/recommendationService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export default async function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const session = requireTeamSession();
  const snapshot = await getWorkspaceSnapshot(session);

  const task = snapshot.data.tasks.find((candidate) => candidate.id === params.taskId);
  if (!task) {
    notFound();
  }

  const votes = snapshot.data.votes.filter((vote) => vote.taskId === task.id);
  const comments = snapshot.data.comments
    .filter((comment) => comment.taskId === task.id)
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

  const recommendations = recommendAssignees(task, snapshot.data.members, snapshot.data.tasks);

  return (
    <TaskDetailClient
      task={task}
      members={snapshot.data.members}
      votes={votes}
      comments={comments}
      currentUserId={session.id}
      mode={session.mode}
      recommendations={recommendations}
    />
  );
}
