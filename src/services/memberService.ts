import { Member, Task } from "@/types";
import { getAssignedPointsByMember } from "@/services/taskService";

export interface MemberSummary {
  member: Member;
  assignedTaskCount: number;
  completedTaskCount: number;
  assignedStoryPoints: number;
  completedStoryPoints: number;
}

export function buildMemberSummaries(members: Member[], tasks: Task[]): MemberSummary[] {
  const assignedPoints = getAssignedPointsByMember(tasks);

  return members.map((member) => {
    const assignedTasks = tasks.filter((task) => task.assigneeId === member.id);
    const completedTasks = assignedTasks.filter((task) => task.status === "done");

    return {
      member,
      assignedTaskCount: assignedTasks.length,
      completedTaskCount: completedTasks.length,
      assignedStoryPoints: assignedPoints[member.id] ?? 0,
      completedStoryPoints: completedTasks.reduce(
        (sum, task) => sum + (task.officialStoryPoints ?? 0),
        0
      )
    };
  });
}

export function getMemberById(members: Member[], memberId: string): Member | null {
  return members.find((member) => member.id === memberId) ?? null;
}
