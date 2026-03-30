export type DataMode = "demo" | "supabase";

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

export type Priority = "low" | "medium" | "high" | "critical";

export type VoteValue = 1 | 2 | 3 | 5 | 8 | 13;

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TimeBlock = "morning" | "afternoon" | "evening";

export type NotificationType =
  | "vote_needed"
  | "task_overdue"
  | "task_assigned"
  | "member_overloaded"
  | "vote_disagreement"
  | "deadline_approaching";

export interface AvailabilitySlot {
  day: Weekday;
  block: TimeBlock;
}

export interface Team {
  id: string;
  name: string;
  projectName: string;
}

export interface TeamMembership {
  teamId: string;
  teamName: string;
  projectName: string;
  memberRole: string;
  joinedAt: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  preferredWorkingStyle: string;
  availability: AvailabilitySlot[];
  reliabilityScore: number;
  avatarColor: string;
}

export interface Task {
  id: string;
  teamId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  dueDate: string;
  assigneeId: string | null;
  votingRequired: boolean;
  votingClosed: boolean;
  officialStoryPoints: number | null;
  createdById: string;
  createdByName?: string | null;
  assigneeName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  dueDate: string;
  votingRequired: boolean;
}

export interface TaskVote {
  id: string;
  taskId: string;
  memberId: string;
  value: VoteValue;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  memberId: string;
  message: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  teamId: string;
  type: NotificationType;
  message: string;
  taskId: string | null;
  memberId: string | null;
  isRead: boolean;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  memberId: string | null;
  message: string;
  createdAt: string;
}

export interface WorkspaceData {
  team: Team;
  members: Member[];
  tasks: Task[];
  votes: TaskVote[];
  comments: TaskComment[];
  notifications: NotificationItem[];
}

export interface SessionUser {
  id: string;
  mode: DataMode;
  name: string;
  email?: string;
  teamId?: string;
  teamName?: string;
  projectName?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface FairnessBreakdown {
  assignedBalanceScore: number;
  completedBalanceScore: number;
  overduePenalty: number;
  votingComplianceScore: number;
  overloadPenalty: number;
}

export interface FairnessResult {
  score: number;
  breakdown: FairnessBreakdown;
  explanation: string;
  overloadedMemberIds: string[];
}

export interface VotingInsight {
  taskId: string;
  average: number | null;
  disagreement: number;
  votedMemberIds: string[];
  missingMemberIds: string[];
  isStrongDisagreement: boolean;
}

export interface WorkspaceSnapshot {
  data: WorkspaceData;
  fairness: FairnessResult;
  activityFeed: ActivityEvent[];
  pendingVotesCount: number;
  overdueCount: number;
}
