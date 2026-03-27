import { FairnessResult, NotificationItem, Task, TaskVote, WorkspaceData } from "@/types";
import { getVotingInsight } from "@/services/voteService";

function buildDynamicNotifications(data: WorkspaceData, fairness: FairnessResult): NotificationItem[] {
  const teamId = data.team.id;
  const memberIds = data.members.map((member) => member.id);

  const dynamic: NotificationItem[] = [];

  for (const task of data.tasks) {
    if (task.votingRequired && !task.votingClosed) {
      const insight = getVotingInsight(task, memberIds, data.votes);
      if (insight.missingMemberIds.length > 0) {
        dynamic.push({
          id: `dynamic-vote-${task.id}`,
          teamId,
          type: "vote_needed",
          message: `Vote required: \"${task.title}\" still needs ${insight.missingMemberIds.length} vote(s).`,
          taskId: task.id,
          memberId: null,
          isRead: false,
          severity: "warning",
          createdAt: new Date().toISOString()
        });
      }
    }

    if (task.status !== "done" && new Date(task.dueDate).getTime() < Date.now()) {
      dynamic.push({
        id: `dynamic-overdue-${task.id}`,
        teamId,
        type: "task_overdue",
        message: `Overdue task: \"${task.title}\" is past due.`,
        taskId: task.id,
        memberId: task.assigneeId,
        isRead: false,
        severity: "critical",
        createdAt: new Date().toISOString()
      });
    }

    const insight = getVotingInsight(task, memberIds, data.votes);
    if (insight.isStrongDisagreement) {
      dynamic.push({
        id: `dynamic-disagreement-${task.id}`,
        teamId,
        type: "vote_disagreement",
        message: `Strong vote disagreement detected on \"${task.title}\".`,
        taskId: task.id,
        memberId: null,
        isRead: false,
        severity: "warning",
        createdAt: new Date().toISOString()
      });
    }

    const hoursUntilDue = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
    if (task.status !== "done" && hoursUntilDue > 0 && hoursUntilDue < 48) {
      dynamic.push({
        id: `dynamic-deadline-${task.id}`,
        teamId,
        type: "deadline_approaching",
        message: `Deadline approaching: \"${task.title}\" is due soon.`,
        taskId: task.id,
        memberId: task.assigneeId,
        isRead: false,
        severity: "warning",
        createdAt: new Date().toISOString()
      });
    }
  }

  for (const memberId of fairness.overloadedMemberIds) {
    const memberName = data.members.find((member) => member.id === memberId)?.name ?? "A team member";
    dynamic.push({
      id: `dynamic-overload-${memberId}`,
      teamId,
      type: "member_overloaded",
      message: `${memberName} appears overloaded based on current active story points.`,
      taskId: null,
      memberId,
      isRead: false,
      severity: "warning",
      createdAt: new Date().toISOString()
    });
  }

  return dynamic;
}

export function buildNotificationFeed(data: WorkspaceData, fairness: FairnessResult): NotificationItem[] {
  const merged = [...data.notifications, ...buildDynamicNotifications(data, fairness)];

  const dedupedByMessage = new Map<string, NotificationItem>();
  for (const notification of merged) {
    if (!dedupedByMessage.has(notification.message)) {
      dedupedByMessage.set(notification.message, notification);
    }
  }

  return [...dedupedByMessage.values()]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 14);
}

export function countUnreadNotifications(notifications: NotificationItem[]): number {
  return notifications.filter((notification) => !notification.isRead).length;
}
