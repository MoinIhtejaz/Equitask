import { Member, NotificationItem, Task, TaskComment, TaskVote, WorkspaceData } from "@/types";

const TEAM_ID = "team-alpha";

function dateWithOffset(daysOffset: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const DEMO_MEMBER_IDS = {
  moin: "member-moin",
  peter: "member-peter",
  james: "member-james",
  jaret: "member-jaret"
} as const;

const members: Member[] = [
  {
    id: DEMO_MEMBER_IDS.moin,
    name: "Moin",
    role: "Full stack oriented builder",
    bio: "Strong at building interfaces, fixing issues quickly, and keeping work organised.",
    preferredWorkingStyle: "Structured and consistent, likes clear ownership",
    availability: [
      { day: "monday", block: "evening" },
      { day: "tuesday", block: "afternoon" },
      { day: "wednesday", block: "evening" },
      { day: "friday", block: "afternoon" },
      { day: "saturday", block: "morning" }
    ],
    reliabilityScore: 92,
    avatarColor: "#2f6b4f"
  },
  {
    id: DEMO_MEMBER_IDS.peter,
    name: "Peter",
    role: "Backend and quality focused engineer",
    bio: "Reliable in implementation, testing, and technical structure.",
    preferredWorkingStyle: "Quiet and methodical, likes clearly scoped technical tasks",
    availability: [
      { day: "monday", block: "morning" },
      { day: "tuesday", block: "evening" },
      { day: "thursday", block: "afternoon" },
      { day: "friday", block: "evening" },
      { day: "sunday", block: "afternoon" }
    ],
    reliabilityScore: 88,
    avatarColor: "#225ea8"
  },
  {
    id: DEMO_MEMBER_IDS.james,
    name: "James",
    role: "Research and planning heavy contributor",
    bio: "Strong at documentation, analysis, requirement shaping, and team coordination.",
    preferredWorkingStyle: "Collaborative and discussion driven, likes planning before execution",
    availability: [
      { day: "tuesday", block: "morning" },
      { day: "wednesday", block: "afternoon" },
      { day: "thursday", block: "evening" },
      { day: "saturday", block: "afternoon" },
      { day: "sunday", block: "morning" }
    ],
    reliabilityScore: 84,
    avatarColor: "#8e5b2f"
  },
  {
    id: DEMO_MEMBER_IDS.jaret,
    name: "Jaret",
    role: "Design driven product builder",
    bio: "Strong at visual polish, user facing flow, and presentation quality.",
    preferredWorkingStyle: "Creative and user focused, likes iterating on visible output",
    availability: [
      { day: "monday", block: "afternoon" },
      { day: "wednesday", block: "morning" },
      { day: "thursday", block: "afternoon" },
      { day: "friday", block: "morning" },
      { day: "saturday", block: "evening" }
    ],
    reliabilityScore: 86,
    avatarColor: "#b44b2f"
  }
];

const tasks: Task[] = [
  {
    id: "task-1",
    teamId: TEAM_ID,
    title: "Set up Next.js project shell",
    description: "Initialize App Router structure, TypeScript setup, and base layout scaffolding.",
    status: "done",
    priority: "high",
    tags: ["setup", "architecture"],
    dueDate: dateWithOffset(-18),
    assigneeId: DEMO_MEMBER_IDS.moin,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 3,
    createdById: DEMO_MEMBER_IDS.james,
    createdAt: dateWithOffset(-24),
    updatedAt: dateWithOffset(-17)
  },
  {
    id: "task-2",
    teamId: TEAM_ID,
    title: "Design landing page",
    description: "Create the hero section, feature cards, and CTA flow for new users.",
    status: "done",
    priority: "medium",
    tags: ["frontend", "design"],
    dueDate: dateWithOffset(-12),
    assigneeId: DEMO_MEMBER_IDS.jaret,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 5,
    createdById: DEMO_MEMBER_IDS.moin,
    createdAt: dateWithOffset(-20),
    updatedAt: dateWithOffset(-11)
  },
  {
    id: "task-3",
    teamId: TEAM_ID,
    title: "Build sign in flow",
    description: "Support Supabase-ready email/password auth.",
    status: "review",
    priority: "high",
    tags: ["auth", "backend"],
    dueDate: dateWithOffset(1),
    assigneeId: DEMO_MEMBER_IDS.peter,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 5,
    createdById: DEMO_MEMBER_IDS.moin,
    createdAt: dateWithOffset(-9),
    updatedAt: dateWithOffset(-1)
  },
  {
    id: "task-4",
    teamId: TEAM_ID,
    title: "Create scrum board UI",
    description: "Implement kanban columns and rich task cards with status controls.",
    status: "in_progress",
    priority: "high",
    tags: ["board", "frontend"],
    dueDate: dateWithOffset(3),
    assigneeId: DEMO_MEMBER_IDS.moin,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 8,
    createdById: DEMO_MEMBER_IDS.jaret,
    createdAt: dateWithOffset(-8),
    updatedAt: dateWithOffset(0)
  },
  {
    id: "task-5",
    teamId: TEAM_ID,
    title: "Implement story point voting",
    description: "Store member votes, compute averages, and detect disagreement.",
    status: "todo",
    priority: "critical",
    tags: ["core-feature", "planning-poker"],
    dueDate: dateWithOffset(4),
    assigneeId: DEMO_MEMBER_IDS.moin,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 6.5,
    createdById: DEMO_MEMBER_IDS.james,
    createdAt: dateWithOffset(-7),
    updatedAt: dateWithOffset(-1)
  },
  {
    id: "task-6",
    teamId: TEAM_ID,
    title: "Build member profile page",
    description: "Show role, bio, availability timetable, reliability, and activity history.",
    status: "review",
    priority: "medium",
    tags: ["profiles", "ux"],
    dueDate: dateWithOffset(2),
    assigneeId: DEMO_MEMBER_IDS.james,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 5,
    createdById: DEMO_MEMBER_IDS.moin,
    createdAt: dateWithOffset(-6),
    updatedAt: dateWithOffset(0)
  },
  {
    id: "task-7",
    teamId: TEAM_ID,
    title: "Create weekly availability grid",
    description: "Render timetable style member availability and meeting-friendly windows.",
    status: "todo",
    priority: "medium",
    tags: ["availability", "team-planning"],
    dueDate: dateWithOffset(5),
    assigneeId: null,
    votingRequired: true,
    votingClosed: false,
    officialStoryPoints: null,
    createdById: DEMO_MEMBER_IDS.jaret,
    createdAt: dateWithOffset(-5),
    updatedAt: dateWithOffset(-2)
  },
  {
    id: "task-8",
    teamId: TEAM_ID,
    title: "Build analytics dashboard",
    description: "Add contribution, velocity, and workload charts.",
    status: "in_progress",
    priority: "high",
    tags: ["analytics", "charts"],
    dueDate: dateWithOffset(6),
    assigneeId: DEMO_MEMBER_IDS.peter,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 8,
    createdById: DEMO_MEMBER_IDS.james,
    createdAt: dateWithOffset(-5),
    updatedAt: dateWithOffset(0)
  },
  {
    id: "task-9",
    teamId: TEAM_ID,
    title: "Add fairness score logic",
    description: "Calculate fairness from workload balance, overdue count, and voting compliance.",
    status: "todo",
    priority: "high",
    tags: ["fairness", "metrics"],
    dueDate: dateWithOffset(2),
    assigneeId: DEMO_MEMBER_IDS.moin,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 5,
    createdById: DEMO_MEMBER_IDS.peter,
    createdAt: dateWithOffset(-4),
    updatedAt: dateWithOffset(-1)
  },
  {
    id: "task-10",
    teamId: TEAM_ID,
    title: "Create notification centre",
    description: "Aggregate vote reminders, deadline risks, and overload alerts.",
    status: "backlog",
    priority: "medium",
    tags: ["notifications", "ux"],
    dueDate: dateWithOffset(7),
    assigneeId: null,
    votingRequired: true,
    votingClosed: false,
    officialStoryPoints: null,
    createdById: DEMO_MEMBER_IDS.moin,
    createdAt: dateWithOffset(-4),
    updatedAt: dateWithOffset(-2)
  },
  {
    id: "task-11",
    teamId: TEAM_ID,
    title: "Write demo team activity feed",
    description: "Seed realistic events to make accountability patterns visible.",
    status: "done",
    priority: "low",
    tags: ["seed-data", "activity"],
    dueDate: dateWithOffset(-1),
    assigneeId: DEMO_MEMBER_IDS.james,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 3,
    createdById: DEMO_MEMBER_IDS.jaret,
    createdAt: dateWithOffset(-3),
    updatedAt: dateWithOffset(-1)
  },
  {
    id: "task-12",
    teamId: TEAM_ID,
    title: "Demo testing and polish",
    description: "Run end-to-end pass and close visual inconsistencies.",
    status: "todo",
    priority: "high",
    tags: ["qa", "polish"],
    dueDate: dateWithOffset(-2),
    assigneeId: DEMO_MEMBER_IDS.jaret,
    votingRequired: true,
    votingClosed: true,
    officialStoryPoints: 2,
    createdById: DEMO_MEMBER_IDS.peter,
    createdAt: dateWithOffset(-2),
    updatedAt: dateWithOffset(-1)
  }
];

const votes: TaskVote[] = [
  { id: "vote-1", taskId: "task-1", memberId: DEMO_MEMBER_IDS.moin, value: 3, createdAt: dateWithOffset(-24) },
  { id: "vote-2", taskId: "task-1", memberId: DEMO_MEMBER_IDS.peter, value: 3, createdAt: dateWithOffset(-24) },
  { id: "vote-3", taskId: "task-1", memberId: DEMO_MEMBER_IDS.james, value: 2, createdAt: dateWithOffset(-23) },
  { id: "vote-4", taskId: "task-1", memberId: DEMO_MEMBER_IDS.jaret, value: 5, createdAt: dateWithOffset(-23) },

  { id: "vote-5", taskId: "task-2", memberId: DEMO_MEMBER_IDS.moin, value: 5, createdAt: dateWithOffset(-20) },
  { id: "vote-6", taskId: "task-2", memberId: DEMO_MEMBER_IDS.peter, value: 3, createdAt: dateWithOffset(-20) },
  { id: "vote-7", taskId: "task-2", memberId: DEMO_MEMBER_IDS.james, value: 5, createdAt: dateWithOffset(-19) },
  { id: "vote-8", taskId: "task-2", memberId: DEMO_MEMBER_IDS.jaret, value: 8, createdAt: dateWithOffset(-19) },

  { id: "vote-9", taskId: "task-3", memberId: DEMO_MEMBER_IDS.moin, value: 5, createdAt: dateWithOffset(-8) },
  { id: "vote-10", taskId: "task-3", memberId: DEMO_MEMBER_IDS.peter, value: 5, createdAt: dateWithOffset(-8) },
  { id: "vote-11", taskId: "task-3", memberId: DEMO_MEMBER_IDS.james, value: 3, createdAt: dateWithOffset(-8) },
  { id: "vote-12", taskId: "task-3", memberId: DEMO_MEMBER_IDS.jaret, value: 8, createdAt: dateWithOffset(-8) },

  { id: "vote-13", taskId: "task-4", memberId: DEMO_MEMBER_IDS.moin, value: 8, createdAt: dateWithOffset(-7) },
  { id: "vote-14", taskId: "task-4", memberId: DEMO_MEMBER_IDS.peter, value: 8, createdAt: dateWithOffset(-7) },
  { id: "vote-15", taskId: "task-4", memberId: DEMO_MEMBER_IDS.james, value: 5, createdAt: dateWithOffset(-7) },
  { id: "vote-16", taskId: "task-4", memberId: DEMO_MEMBER_IDS.jaret, value: 13, createdAt: dateWithOffset(-7) },

  { id: "vote-17", taskId: "task-5", memberId: DEMO_MEMBER_IDS.moin, value: 13, createdAt: dateWithOffset(-6) },
  { id: "vote-18", taskId: "task-5", memberId: DEMO_MEMBER_IDS.peter, value: 3, createdAt: dateWithOffset(-6) },
  { id: "vote-19", taskId: "task-5", memberId: DEMO_MEMBER_IDS.james, value: 8, createdAt: dateWithOffset(-6) },
  { id: "vote-20", taskId: "task-5", memberId: DEMO_MEMBER_IDS.jaret, value: 2, createdAt: dateWithOffset(-6) },

  { id: "vote-21", taskId: "task-6", memberId: DEMO_MEMBER_IDS.moin, value: 5, createdAt: dateWithOffset(-5) },
  { id: "vote-22", taskId: "task-6", memberId: DEMO_MEMBER_IDS.peter, value: 3, createdAt: dateWithOffset(-5) },
  { id: "vote-23", taskId: "task-6", memberId: DEMO_MEMBER_IDS.james, value: 5, createdAt: dateWithOffset(-5) },
  { id: "vote-24", taskId: "task-6", memberId: DEMO_MEMBER_IDS.jaret, value: 8, createdAt: dateWithOffset(-5) },

  { id: "vote-25", taskId: "task-7", memberId: DEMO_MEMBER_IDS.moin, value: 5, createdAt: dateWithOffset(-4) },
  { id: "vote-26", taskId: "task-7", memberId: DEMO_MEMBER_IDS.james, value: 3, createdAt: dateWithOffset(-4) },

  { id: "vote-27", taskId: "task-8", memberId: DEMO_MEMBER_IDS.moin, value: 8, createdAt: dateWithOffset(-4) },
  { id: "vote-28", taskId: "task-8", memberId: DEMO_MEMBER_IDS.peter, value: 8, createdAt: dateWithOffset(-4) },
  { id: "vote-29", taskId: "task-8", memberId: DEMO_MEMBER_IDS.james, value: 5, createdAt: dateWithOffset(-4) },
  { id: "vote-30", taskId: "task-8", memberId: DEMO_MEMBER_IDS.jaret, value: 13, createdAt: dateWithOffset(-4) },

  { id: "vote-31", taskId: "task-9", memberId: DEMO_MEMBER_IDS.moin, value: 5, createdAt: dateWithOffset(-3) },
  { id: "vote-32", taskId: "task-9", memberId: DEMO_MEMBER_IDS.peter, value: 5, createdAt: dateWithOffset(-3) },
  { id: "vote-33", taskId: "task-9", memberId: DEMO_MEMBER_IDS.james, value: 5, createdAt: dateWithOffset(-3) },
  { id: "vote-34", taskId: "task-9", memberId: DEMO_MEMBER_IDS.jaret, value: 5, createdAt: dateWithOffset(-3) },

  { id: "vote-35", taskId: "task-10", memberId: DEMO_MEMBER_IDS.peter, value: 2, createdAt: dateWithOffset(-2) },

  { id: "vote-36", taskId: "task-11", memberId: DEMO_MEMBER_IDS.moin, value: 3, createdAt: dateWithOffset(-3) },
  { id: "vote-37", taskId: "task-11", memberId: DEMO_MEMBER_IDS.peter, value: 2, createdAt: dateWithOffset(-3) },
  { id: "vote-38", taskId: "task-11", memberId: DEMO_MEMBER_IDS.james, value: 3, createdAt: dateWithOffset(-3) },
  { id: "vote-39", taskId: "task-11", memberId: DEMO_MEMBER_IDS.jaret, value: 5, createdAt: dateWithOffset(-3) },

  { id: "vote-40", taskId: "task-12", memberId: DEMO_MEMBER_IDS.moin, value: 2, createdAt: dateWithOffset(-3) },
  { id: "vote-41", taskId: "task-12", memberId: DEMO_MEMBER_IDS.peter, value: 2, createdAt: dateWithOffset(-3) },
  { id: "vote-42", taskId: "task-12", memberId: DEMO_MEMBER_IDS.james, value: 2, createdAt: dateWithOffset(-3) },
  { id: "vote-43", taskId: "task-12", memberId: DEMO_MEMBER_IDS.jaret, value: 2, createdAt: dateWithOffset(-3) }
];

const comments: TaskComment[] = [
  {
    id: "comment-1",
    taskId: "task-4",
    memberId: DEMO_MEMBER_IDS.jaret,
    message: "Let us keep card metadata compact so board scanning stays fast.",
    createdAt: dateWithOffset(-1)
  },
  {
    id: "comment-2",
    taskId: "task-5",
    memberId: DEMO_MEMBER_IDS.james,
    message: "We should show disagreement warnings in plain language for non-technical teammates.",
    createdAt: dateWithOffset(-1)
  },
  {
    id: "comment-3",
    taskId: "task-12",
    memberId: DEMO_MEMBER_IDS.peter,
    message: "Polish task is overdue, can we split ownership and close it today?",
    createdAt: dateWithOffset(0)
  }
];

const notifications: NotificationItem[] = [
  {
    id: "notif-1",
    teamId: TEAM_ID,
    type: "vote_needed",
    message: "Task \"Create weekly availability grid\" is still waiting for 2 votes.",
    taskId: "task-7",
    memberId: null,
    isRead: false,
    severity: "warning",
    createdAt: dateWithOffset(0)
  },
  {
    id: "notif-2",
    teamId: TEAM_ID,
    type: "task_overdue",
    message: "Task \"Demo testing and polish\" is overdue.",
    taskId: "task-12",
    memberId: DEMO_MEMBER_IDS.jaret,
    isRead: false,
    severity: "critical",
    createdAt: dateWithOffset(0)
  },
  {
    id: "notif-3",
    teamId: TEAM_ID,
    type: "member_overloaded",
    message: "Moin is carrying more active story points than the team average.",
    taskId: null,
    memberId: DEMO_MEMBER_IDS.moin,
    isRead: false,
    severity: "warning",
    createdAt: dateWithOffset(0)
  },
  {
    id: "notif-4",
    teamId: TEAM_ID,
    type: "vote_disagreement",
    message: "Strong vote disagreement detected on \"Implement story point voting\".",
    taskId: "task-5",
    memberId: null,
    isRead: false,
    severity: "warning",
    createdAt: dateWithOffset(-1)
  },
  {
    id: "notif-5",
    teamId: TEAM_ID,
    type: "task_assigned",
    message: "\"Add fairness score logic\" was assigned to Moin.",
    taskId: "task-9",
    memberId: DEMO_MEMBER_IDS.moin,
    isRead: true,
    severity: "info",
    createdAt: dateWithOffset(-1)
  },
  {
    id: "notif-6",
    teamId: TEAM_ID,
    type: "deadline_approaching",
    message: "\"Build sign in flow\" is due within 24 hours.",
    taskId: "task-3",
    memberId: DEMO_MEMBER_IDS.peter,
    isRead: false,
    severity: "warning",
    createdAt: dateWithOffset(0)
  }
];

const baseWorkspace: WorkspaceData = {
  team: {
    id: TEAM_ID,
    name: "Team Equitask Alpha",
    projectName: "Equitask Student Collaboration Platform"
  },
  members,
  tasks,
  votes,
  comments,
  notifications
};

export function createDemoWorkspaceData(): WorkspaceData {
  return JSON.parse(JSON.stringify(baseWorkspace)) as WorkspaceData;
}
