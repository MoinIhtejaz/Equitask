import { createDemoWorkspaceData } from "@/data/seed/demoData";
import {
  CommentInput,
  CreateTeamInput,
  DataProvider,
  JoinTeamInput,
  VoteInput
} from "@/data/providers/providerTypes";
import { CreateTaskInput, Task, TaskComment, TaskStatus, TaskVote, TeamMembership, WorkspaceData } from "@/types";

let demoWorkspaceState: WorkspaceData | null = null;

function getState(): WorkspaceData {
  if (!demoWorkspaceState) {
    demoWorkspaceState = createDemoWorkspaceData();
  }
  return demoWorkspaceState;
}

function nowIso(): string {
  return new Date().toISOString();
}

function getTaskByIdOrThrow(state: WorkspaceData, taskId: string): Task {
  const task = state.tasks.find((candidate) => candidate.id === taskId);
  if (!task) {
    throw new Error("Task not found.");
  }
  return task;
}

function recalculateTaskVoting(taskId: string, state: WorkspaceData): void {
  const task = getTaskByIdOrThrow(state, taskId);
  const taskVotes = state.votes.filter((vote) => vote.taskId === taskId);

  if (!task.votingRequired) {
    return;
  }

  const allMemberIds = new Set(state.members.map((member) => member.id));
  const votedMemberIds = new Set(taskVotes.map((vote) => vote.memberId));

  if (allMemberIds.size > 0 && votedMemberIds.size === allMemberIds.size) {
    const average = taskVotes.reduce((sum, vote) => sum + vote.value, 0) / taskVotes.length;
    task.votingClosed = true;
    task.officialStoryPoints = Number(average.toFixed(1));
  } else {
    task.votingClosed = false;
    task.officialStoryPoints = null;
  }

  task.updatedAt = nowIso();
}

function createMembershipFromState(state: WorkspaceData): TeamMembership {
  return {
    teamId: state.team.id,
    teamName: state.team.name,
    projectName: state.team.projectName,
    memberRole: "owner",
    joinedAt: nowIso()
  };
}

export const demoProvider: DataProvider = {
  async getWorkspace() {
    return getState();
  },

  async updateTaskStatus(_session, taskId: string, status: TaskStatus) {
    const state = getState();
    const task = getTaskByIdOrThrow(state, taskId);
    task.status = status;
    task.updatedAt = nowIso();
    return task;
  },

  async assignTask(_session, taskId: string, assigneeId: string | null) {
    const state = getState();
    const task = getTaskByIdOrThrow(state, taskId);

    if (assigneeId && task.votingRequired && !task.votingClosed) {
      throw new Error("Complete voting before assigning this task.");
    }

    if (assigneeId && !state.members.some((member) => member.id === assigneeId)) {
      throw new Error("Selected assignee is not a member of this team.");
    }

    task.assigneeId = assigneeId;
    task.updatedAt = nowIso();
    return task;
  },

  async createTask(_session, input: CreateTaskInput): Promise<Task> {
    const state = getState();

    const task: Task = {
      id: `task-${crypto.randomUUID()}`,
      teamId: state.team.id,
      title: input.title,
      description: input.description,
      status: "backlog",
      priority: input.priority,
      tags: input.tags,
      dueDate: new Date(input.dueDate).toISOString(),
      assigneeId: null,
      votingRequired: input.votingRequired,
      votingClosed: !input.votingRequired,
      officialStoryPoints: null,
      createdById: "member-moin",
      createdByName: "Moin",
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    state.tasks.unshift(task);
    return task;
  },

  async submitVote(_session, input: VoteInput): Promise<TaskVote[]> {
    const state = getState();
    getTaskByIdOrThrow(state, input.taskId);

    const existing = state.votes.find(
      (vote) => vote.taskId === input.taskId && vote.memberId === input.memberId
    );

    if (existing) {
      existing.value = input.value;
      existing.createdAt = nowIso();
    } else {
      state.votes.push({
        id: `vote-${crypto.randomUUID()}`,
        taskId: input.taskId,
        memberId: input.memberId,
        value: input.value,
        createdAt: nowIso()
      });
    }

    recalculateTaskVoting(input.taskId, state);

    return state.votes.filter((vote) => vote.taskId === input.taskId);
  },

  async addComment(_session, input: CommentInput): Promise<TaskComment> {
    const state = getState();
    getTaskByIdOrThrow(state, input.taskId);
    const message = input.message?.trim();

    if (!message) {
      throw new Error("Comment cannot be empty.");
    }

    const comment: TaskComment = {
      id: `comment-${crypto.randomUUID()}`,
      taskId: input.taskId,
      memberId: input.memberId,
      message,
      createdAt: nowIso()
    };

    state.comments.push(comment);

    const task = getTaskByIdOrThrow(state, input.taskId);
    task.updatedAt = nowIso();

    return comment;
  },

  async listTeams() {
    const state = getState();
    return [createMembershipFromState(state)];
  },

  async createTeam(_session, input: CreateTeamInput) {
    const state = getState();
    state.team = {
      id: `team-${crypto.randomUUID()}`,
      name: input.name,
      projectName: input.projectName
    };
    state.tasks = [];
    state.votes = [];
    state.comments = [];
    state.notifications = [];
    return createMembershipFromState(state);
  },

  async joinTeam(_session, _input: JoinTeamInput) {
    throw new Error("Joining teams by code is only available in Supabase mode.");
  }
};
