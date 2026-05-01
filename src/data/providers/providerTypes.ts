import {
  CreateTaskInput,
  SessionUser,
  Task,
  TaskComment,
  TaskStatus,
  TaskVote,
  TeamMembership,
  VoteValue,
  WorkspaceData
} from "@/types";

export interface EncryptedCommentInput {
  ciphertext: string;
  iv: string;
  encryptionVersion: string;
  encryptionAlgorithm: string;
  keyId?: string | null;
}

export interface VoteInput {
  taskId: string;
  memberId: string;
  value: VoteValue;
}

export interface CommentInput {
  taskId: string;
  memberId: string;
  message?: string;
  encryptedComment?: EncryptedCommentInput;
}

export interface CreateTeamInput {
  name: string;
  projectName: string;
}

export interface JoinTeamInput {
  teamCode?: string;
  teamName?: string;
}

export interface DataProvider {
  getWorkspace(session: SessionUser): Promise<WorkspaceData>;
  updateTaskStatus(session: SessionUser, taskId: string, status: TaskStatus): Promise<Task>;
  assignTask(session: SessionUser, taskId: string, assigneeId: string | null): Promise<Task>;
  createTask(session: SessionUser, input: CreateTaskInput): Promise<Task>;
  submitVote(session: SessionUser, input: VoteInput): Promise<TaskVote[]>;
  addComment(session: SessionUser, input: CommentInput): Promise<TaskComment>;
  listTeams(session: SessionUser): Promise<TeamMembership[]>;
  createTeam(session: SessionUser, input: CreateTeamInput): Promise<TeamMembership>;
  joinTeam(session: SessionUser, input: JoinTeamInput): Promise<TeamMembership>;
}
