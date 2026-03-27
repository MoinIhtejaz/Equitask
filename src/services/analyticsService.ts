import { FairnessResult, Member, Task, TaskVote } from "@/types";
import { STATUS_LABELS } from "@/lib/constants";
import { getVotingInsight } from "@/services/voteService";

export interface AnalyticsSnapshot {
  completedByMember: Array<{ name: string; value: number }>;
  storyPointsByMember: Array<{ name: string; value: number }>;
  workloadDistribution: Array<{ name: string; value: number }>;
  statusDistribution: Array<{ status: string; value: number }>;
  progressOverTime: Array<{ label: string; completed: number; total: number }>;
  votingAgreement: Array<{ task: string; disagreement: number; average: number }>;
  fairnessScore: number;
  deadlineRisk: "Low" | "Medium" | "High";
}

function mapMemberName(memberId: string, members: Member[]): string {
  return members.find((member) => member.id === memberId)?.name ?? "Unassigned";
}

function buildProgressOverTime(tasks: Task[]): Array<{ label: string; completed: number; total: number }> {
  const ordered = [...tasks].sort(
    (first, second) => new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime()
  );

  let completed = 0;
  return ordered.map((task, index) => {
    if (task.status === "done") {
      completed += 1;
    }

    return {
      label: new Date(task.dueDate).toLocaleDateString("en-AU", { day: "2-digit", month: "short" }),
      completed,
      total: index + 1
    };
  });
}

export function buildAnalyticsSnapshot(
  tasks: Task[],
  members: Member[],
  votes: TaskVote[],
  fairness: FairnessResult
): AnalyticsSnapshot {
  const completedByMember = members.map((member) => ({
    name: member.name,
    value: tasks.filter((task) => task.assigneeId === member.id && task.status === "done").length
  }));

  const storyPointsByMember = members.map((member) => ({
    name: member.name,
    value: tasks
      .filter((task) => task.assigneeId === member.id && task.status === "done")
      .reduce((sum, task) => sum + (task.officialStoryPoints ?? 0), 0)
  }));

  const workloadDistribution = members.map((member) => ({
    name: member.name,
    value: tasks
      .filter((task) => task.assigneeId === member.id && task.status !== "done")
      .reduce((sum, task) => sum + (task.officialStoryPoints ?? 0), 0)
  }));

  const statusDistribution = Object.entries(STATUS_LABELS).map(([status, label]) => ({
    status: label,
    value: tasks.filter((task) => task.status === status).length
  }));

  const votingAgreement = tasks
    .filter((task) => task.votingRequired)
    .map((task) => {
      const insight = getVotingInsight(
        task,
        members.map((member) => member.id),
        votes
      );

      return {
        task: task.title,
        disagreement: insight.disagreement,
        average: insight.average ?? 0
      };
    })
    .slice(0, 8);

  const overdueOpenTasks = tasks.filter(
    (task) => task.status !== "done" && new Date(task.dueDate).getTime() < Date.now()
  ).length;

  const deadlineRisk: "Low" | "Medium" | "High" =
    overdueOpenTasks >= 3 ? "High" : overdueOpenTasks >= 1 ? "Medium" : "Low";

  return {
    completedByMember,
    storyPointsByMember,
    workloadDistribution,
    statusDistribution,
    progressOverTime: buildProgressOverTime(tasks),
    votingAgreement,
    fairnessScore: fairness.score,
    deadlineRisk
  };
}

export function getTaskSummaryText(task: Task, members: Member[]): string {
  const assignee = task.assigneeId ? mapMemberName(task.assigneeId, members) : "Unassigned";
  return `${task.title} • ${assignee}`;
}
