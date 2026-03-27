import { clamp, stdDev } from "@/lib/utils";
import { FairnessResult, Member, Task, TaskVote } from "@/types";
import { getAssignedPointsByMember, getOverdueTasks } from "@/services/taskService";

function scoreBalance(values: number[]): number {
  if (!values.length || values.every((value) => value === 0)) {
    return 100;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean === 0) {
    return 100;
  }

  const coefficient = stdDev(values) / mean;
  return Math.round(clamp(100 - coefficient * 70, 0, 100));
}

export function calculateFairnessScore(
  tasks: Task[],
  members: Member[],
  votes: TaskVote[]
): FairnessResult {
  const assignedPointsMap = getAssignedPointsByMember(tasks);

  const assignedPointsVector = members.map((member) => assignedPointsMap[member.id] ?? 0);

  const completedPointsVector = members.map((member) => {
    return tasks
      .filter((task) => task.assigneeId === member.id && task.status === "done")
      .reduce((sum, task) => sum + (task.officialStoryPoints ?? 0), 0);
  });

  const assignedBalanceScore = scoreBalance(assignedPointsVector);
  const completedBalanceScore = scoreBalance(completedPointsVector);

  const overdueTasks = getOverdueTasks(tasks);
  const overduePenalty = Math.min(35, overdueTasks.length * 7);

  const votedBeforeAssignment = tasks.filter((task) => {
    if (!task.assigneeId || !task.votingRequired) {
      return true;
    }

    const taskVotes = votes.filter((vote) => vote.taskId === task.id);
    return task.votingClosed || taskVotes.length >= members.length;
  });

  const votingComplianceScore = tasks.length
    ? Math.round((votedBeforeAssignment.length / tasks.length) * 100)
    : 100;

  const activePoints = members.map((member) => {
    return tasks
      .filter((task) => task.assigneeId === member.id && task.status !== "done")
      .reduce((sum, task) => sum + (task.officialStoryPoints ?? 0), 0);
  });

  const activeAverage =
    activePoints.length > 0 ? activePoints.reduce((sum, value) => sum + value, 0) / activePoints.length : 0;

  const overloadedMemberIds = members
    .filter((member, index) => activeAverage > 0 && activePoints[index] > activeAverage * 1.35)
    .map((member) => member.id);

  const overloadPenalty = Math.min(20, overloadedMemberIds.length * 10);

  const combinedScore =
    assignedBalanceScore * 0.3 +
    completedBalanceScore * 0.25 +
    votingComplianceScore * 0.25 +
    (100 - overduePenalty) * 0.1 +
    (100 - overloadPenalty) * 0.1;

  const score = Math.round(clamp(combinedScore, 0, 100));

  return {
    score,
    breakdown: {
      assignedBalanceScore,
      completedBalanceScore,
      overduePenalty,
      votingComplianceScore,
      overloadPenalty
    },
    explanation:
      "Fairness combines workload balance, completed effort distribution, overdue pressure, vote-before-assignment discipline, and overload risk.",
    overloadedMemberIds
  };
}
