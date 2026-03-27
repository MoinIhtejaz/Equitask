import { getDataProvider } from "@/data/providers/providerFactory";
import { CommentInput, VoteInput } from "@/data/providers/providerTypes";
import { CreateTaskInput, SessionUser, TaskStatus, WorkspaceSnapshot } from "@/types";
import { calculateFairnessScore } from "@/services/fairnessService";
import { buildNotificationFeed } from "@/services/notificationService";
import { getOverdueTasks } from "@/services/taskService";
import { countPendingVotes } from "@/services/voteService";

function buildActivityFeed(snapshot: WorkspaceSnapshot["data"]): WorkspaceSnapshot["activityFeed"] {
  const memberMap = new Map(snapshot.members.map((member) => [member.id, member.name]));
  const taskMap = new Map(snapshot.tasks.map((task) => [task.id, task.title]));

  const voteEvents = snapshot.votes.map((vote) => ({
    id: `activity-vote-${vote.id}`,
    memberId: vote.memberId,
    message: `${memberMap.get(vote.memberId) ?? "A member"} voted ${vote.value} on ${
      taskMap.get(vote.taskId) ?? "a task"
    }`,
    createdAt: vote.createdAt
  }));

  const commentEvents = snapshot.comments.map((comment) => ({
    id: `activity-comment-${comment.id}`,
    memberId: comment.memberId,
    message: `${memberMap.get(comment.memberId) ?? "A member"} commented on ${
      taskMap.get(comment.taskId) ?? "a task"
    }`,
    createdAt: comment.createdAt
  }));

  const taskEvents = snapshot.tasks.map((task) => ({
    id: `activity-task-${task.id}`,
    memberId: task.assigneeId,
    message: `${task.title} is now ${task.status.replace("_", " ")}.`,
    createdAt: task.updatedAt
  }));

  return [...voteEvents, ...commentEvents, ...taskEvents]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 12);
}

export async function getWorkspaceSnapshot(session: SessionUser): Promise<WorkspaceSnapshot> {
  const provider = getDataProvider(session);
  const data = await provider.getWorkspace(session);
  const fairness = calculateFairnessScore(data.tasks, data.members, data.votes);
  data.notifications = buildNotificationFeed(data, fairness);

  return {
    data,
    fairness,
    activityFeed: buildActivityFeed(data),
    pendingVotesCount: countPendingVotes(
      data.tasks,
      data.members.map((member) => member.id),
      data.votes
    ),
    overdueCount: getOverdueTasks(data.tasks).length
  };
}

export async function updateTaskStatus(session: SessionUser, taskId: string, status: TaskStatus) {
  const provider = getDataProvider(session);
  return provider.updateTaskStatus(session, taskId, status);
}

export async function assignTask(session: SessionUser, taskId: string, assigneeId: string | null) {
  const provider = getDataProvider(session);
  return provider.assignTask(session, taskId, assigneeId);
}

export async function createTask(session: SessionUser, input: CreateTaskInput) {
  const provider = getDataProvider(session);
  return provider.createTask(session, input);
}

export async function submitVote(session: SessionUser, input: VoteInput) {
  const provider = getDataProvider(session);
  return provider.submitVote(session, input);
}

export async function addComment(session: SessionUser, input: CommentInput) {
  const provider = getDataProvider(session);
  return provider.addComment(session, input);
}
