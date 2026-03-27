import { Task, TaskVote, VotingInsight } from "@/types";

export function getVotesForTask(taskId: string, votes: TaskVote[]): TaskVote[] {
  return votes.filter((vote) => vote.taskId === taskId);
}

export function getVotingInsight(
  task: Task,
  memberIds: string[],
  votes: TaskVote[]
): VotingInsight {
  const taskVotes = getVotesForTask(task.id, votes);
  const votedMemberIds = [...new Set(taskVotes.map((vote) => vote.memberId))];
  const missingMemberIds = memberIds.filter((id) => !votedMemberIds.includes(id));

  const values = taskVotes.map((vote) => vote.value);
  const average = values.length
    ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
    : null;

  const disagreement = values.length ? Math.max(...values) - Math.min(...values) : 0;

  return {
    taskId: task.id,
    average,
    disagreement,
    votedMemberIds,
    missingMemberIds,
    isStrongDisagreement: disagreement >= 5
  };
}

export function countPendingVotes(tasks: Task[], memberIds: string[], votes: TaskVote[]): number {
  return tasks.filter((task) => {
    if (!task.votingRequired || task.votingClosed) {
      return false;
    }

    const insight = getVotingInsight(task, memberIds, votes);
    return insight.missingMemberIds.length > 0;
  }).length;
}
