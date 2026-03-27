import { Priority, TaskStatus, VoteValue, Weekday } from "@/types";

export const APP_NAME = "Equitask";

export const SESSION_COOKIE = "equitask_session";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done"
};

export const STATUS_ORDER: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

export const VOTE_OPTIONS: VoteValue[] = [1, 2, 3, 5, 8, 13];

export const WEEKDAY_ORDER: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

export const TIME_BLOCK_ORDER = ["morning", "afternoon", "evening"] as const;
