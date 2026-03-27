import { Task, TaskStatus } from "@/types";

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return {
    backlog: tasks.filter((task) => task.status === "backlog"),
    todo: tasks.filter((task) => task.status === "todo"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    review: tasks.filter((task) => task.status === "review"),
    done: tasks.filter((task) => task.status === "done")
  };
}

export function getTaskById(tasks: Task[], taskId: string): Task | null {
  return tasks.find((task) => task.id === taskId) ?? null;
}

export function isTaskOverdue(task: Task): boolean {
  return task.status !== "done" && new Date(task.dueDate).getTime() < Date.now();
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  return tasks.filter(isTaskOverdue);
}

export function getTaskCompletionPercentage(tasks: Task[]): number {
  if (!tasks.length) {
    return 0;
  }

  const completedCount = tasks.filter((task) => task.status === "done").length;
  return Math.round((completedCount / tasks.length) * 100);
}

export function getAssignedPointsByMember(tasks: Task[]): Record<string, number> {
  return tasks.reduce<Record<string, number>>((accumulator, task) => {
    if (!task.assigneeId) {
      return accumulator;
    }

    const points = task.officialStoryPoints ?? 0;
    accumulator[task.assigneeId] = (accumulator[task.assigneeId] ?? 0) + points;
    return accumulator;
  }, {});
}
