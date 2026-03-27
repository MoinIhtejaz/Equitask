import { Member, Task } from "@/types";

export interface AssignmentRecommendation {
  memberId: string;
  memberName: string;
  score: number;
  reason: string;
  activePoints: number;
  availabilityMatch: boolean;
}

function getWeekday(value: string): string {
  return new Date(value).toLocaleDateString("en-AU", { weekday: "long" }).toLowerCase();
}

export function recommendAssignees(task: Task, members: Member[], tasks: Task[]): AssignmentRecommendation[] {
  const dueWeekday = getWeekday(task.dueDate);

  const activePointsByMember = members.reduce<Record<string, number>>((accumulator, member) => {
    accumulator[member.id] = tasks
      .filter((candidate) => candidate.assigneeId === member.id && candidate.status !== "done")
      .reduce((sum, candidate) => sum + (candidate.officialStoryPoints ?? 0), 0);
    return accumulator;
  }, {});

  const averageActivePoints =
    members.length > 0
      ? members.reduce((sum, member) => sum + (activePointsByMember[member.id] ?? 0), 0) / members.length
      : 0;

  return members
    .map((member) => {
      const activePoints = activePointsByMember[member.id] ?? 0;
      const availabilityMatch = member.availability.some((slot) => slot.day === dueWeekday);
      const availabilityBonus = availabilityMatch ? 20 : 0;
      const workloadPenalty = activePoints * 4;
      const reliabilityBonus = member.reliabilityScore * 0.2;
      const score = Math.max(0, Math.round(70 + availabilityBonus + reliabilityBonus - workloadPenalty));

      const reason =
        activePoints > averageActivePoints * 1.3
          ? "High current load; assign only if urgency is high."
          : availabilityMatch
            ? "Good fit: has availability on the due day and balanced load."
            : "Balanced capacity, but due-day availability is limited.";

      return {
        memberId: member.id,
        memberName: member.name,
        score,
        reason,
        activePoints,
        availabilityMatch
      };
    })
    .sort((first, second) => second.score - first.score);
}
