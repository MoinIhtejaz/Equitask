import {
  CommentInput,
  CreateTeamInput,
  DataProvider,
  JoinTeamInput,
  VoteInput
} from "@/data/providers/providerTypes";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CreateTaskInput, SessionUser, Task, TaskComment, TaskStatus, TaskVote, TeamMembership, WorkspaceData } from "@/types";

interface TeamRow {
  id: string;
  name: string;
  project_name: string;
}

interface TeamMembershipRow {
  team_id: string;
  member_role: string;
  joined_at: string;
  teams: TeamRow | TeamRow[] | null;
}

interface ProfileRow {
  id: string;
  name: string;
  role: string;
  bio: string;
  preferred_working_style: string;
  availability: unknown;
  reliability_score: number;
  avatar_color: string;
}

interface TeamMemberJoinRow {
  profile_id: string;
  profiles: ProfileRow | null;
}

interface TaskRow {
  id: string;
  team_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Task["priority"];
  tags: string[];
  due_date: string;
  assignee_id: string | null;
  voting_required: boolean;
  voting_closed: boolean;
  official_story_points: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface VoteRow {
  id: string;
  task_id: string;
  member_id: string;
  vote_value: TaskVote["value"];
  created_at: string;
}

interface CommentRow {
  id: string;
  task_id: string;
  member_id: string;
  body: string;
  created_at: string;
}

interface NotificationRow {
  id: string;
  team_id: string;
  type: string;
  message: string;
  task_id: string | null;
  member_id: string | null;
  is_read: boolean;
  severity: "info" | "warning" | "critical";
  created_at: string;
}

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    teamId: row.team_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    tags: Array.isArray(row.tags) ? row.tags : [],
    dueDate: new Date(row.due_date).toISOString(),
    assigneeId: row.assignee_id,
    votingRequired: row.voting_required,
    votingClosed: row.voting_closed,
    officialStoryPoints: row.official_story_points,
    createdById: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toDayOnly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid due date.");
  }
  return date.toISOString().slice(0, 10);
}

function normalizeTeamRow(team: TeamMembershipRow["teams"]): TeamRow | null {
  if (!team) {
    return null;
  }
  if (Array.isArray(team)) {
    return team[0] ?? null;
  }
  return team;
}

async function ensureProfileExists(session: SessionUser) {
  const client = createSupabaseServerClient(session.accessToken);

  const payload = {
    id: session.id,
    name: session.name || "New Member",
    role: "Student collaborator",
    bio: "Ready to contribute to fair group delivery.",
    preferred_working_style: "Collaborative and outcome focused",
    availability: [],
    reliability_score: 80,
    avatar_color: "#2f6b4f"
  };

  const { error } = await client.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) {
    throw new Error(`Failed to ensure profile: ${error.message}`);
  }
}

async function listMemberships(session: SessionUser): Promise<TeamMembership[]> {
  await ensureProfileExists(session);
  const client = createSupabaseServerClient(session.accessToken);

  const membershipsResult = await client
    .from("team_members")
    .select("team_id, member_role, joined_at, teams(id, name, project_name)")
    .eq("profile_id", session.id)
    .order("joined_at", { ascending: true })
    .returns<TeamMembershipRow[]>();

  if (membershipsResult.error) {
    throw new Error(`Failed to load team memberships: ${membershipsResult.error.message}`);
  }

  return (membershipsResult.data || [])
    .map((membership) => {
      const team = normalizeTeamRow(membership.teams);
      if (!team) {
        return null;
      }
      return {
        teamId: membership.team_id,
        teamName: team.name,
        projectName: team.project_name,
        memberRole: membership.member_role,
        joinedAt: membership.joined_at
      };
    })
    .filter((membership): membership is TeamMembership => Boolean(membership));
}

async function getActiveTeamId(session: SessionUser): Promise<string> {
  const memberships = await listMemberships(session);

  if (!memberships.length) {
    throw new Error("No team membership found. Create or join a team first.");
  }

  if (session.teamId) {
    const matchingTeam = memberships.find((membership) => membership.teamId === session.teamId);
    if (matchingTeam) {
      return matchingTeam.teamId;
    }
  }

  return memberships[0].teamId;
}

function mapWorkspace(
  team: TeamRow,
  members: TeamMemberJoinRow[],
  tasks: TaskRow[],
  votes: VoteRow[],
  comments: CommentRow[],
  notifications: NotificationRow[]
): WorkspaceData {
  return {
    team: {
      id: team.id,
      name: team.name,
      projectName: team.project_name
    },
    members: members
      .map((member) => member.profiles)
      .filter((profile): profile is ProfileRow => Boolean(profile))
      .map((profile) => ({
        id: profile.id,
        name: profile.name,
        role: profile.role,
        bio: profile.bio,
        preferredWorkingStyle: profile.preferred_working_style,
        availability: Array.isArray(profile.availability) ? profile.availability : [],
        reliabilityScore: profile.reliability_score,
        avatarColor: profile.avatar_color
      })),
    tasks: tasks.map(mapTaskRow),
    votes: votes.map((vote) => ({
      id: vote.id,
      taskId: vote.task_id,
      memberId: vote.member_id,
      value: vote.vote_value,
      createdAt: vote.created_at
    })),
    comments: comments.map((comment) => ({
      id: comment.id,
      taskId: comment.task_id,
      memberId: comment.member_id,
      message: comment.body,
      createdAt: comment.created_at
    })),
    notifications: notifications.map((item) => ({
      id: item.id,
      teamId: item.team_id,
      type: item.type as WorkspaceData["notifications"][number]["type"],
      message: item.message,
      taskId: item.task_id,
      memberId: item.member_id,
      isRead: item.is_read,
      severity: item.severity,
      createdAt: item.created_at
    }))
  };
}

async function getWorkspaceData(session: SessionUser): Promise<WorkspaceData> {
  const teamId = await getActiveTeamId(session);
  const client = createSupabaseServerClient(session.accessToken);

  const teamResult = await client.from("teams").select("*").eq("id", teamId).single<TeamRow>();
  if (teamResult.error || !teamResult.data) {
    throw new Error(teamResult.error?.message || "Team not found.");
  }

  const membersResult = await client
    .from("team_members")
    .select("profile_id, profiles(*)")
    .eq("team_id", teamId)
    .returns<TeamMemberJoinRow[]>();

  if (membersResult.error) {
    throw new Error(`Failed to load team members: ${membersResult.error.message}`);
  }

  const tasksResult = await client
    .from("tasks")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .returns<TaskRow[]>();

  if (tasksResult.error) {
    throw new Error(`Failed to load tasks: ${tasksResult.error.message}`);
  }

  const taskIds = (tasksResult.data || []).map((task) => task.id);

  const votesResult = taskIds.length
    ? await client
        .from("task_votes")
        .select("*")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false })
        .returns<VoteRow[]>()
    : { data: [] as VoteRow[], error: null };

  if (votesResult.error) {
    throw new Error(`Failed to load votes: ${votesResult.error.message}`);
  }

  const commentsResult = taskIds.length
    ? await client
        .from("comments")
        .select("*")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false })
        .returns<CommentRow[]>()
    : { data: [] as CommentRow[], error: null };

  if (commentsResult.error) {
    throw new Error(`Failed to load comments: ${commentsResult.error.message}`);
  }

  const notificationsResult = await client
    .from("notifications")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<NotificationRow[]>();

  if (notificationsResult.error) {
    throw new Error(`Failed to load notifications: ${notificationsResult.error.message}`);
  }

  return mapWorkspace(
    teamResult.data,
    membersResult.data || [],
    tasksResult.data || [],
    votesResult.data || [],
    commentsResult.data || [],
    notificationsResult.data || []
  );
}

async function ensureTaskBelongsToTeam(session: SessionUser, taskId: string): Promise<TaskRow> {
  const client = createSupabaseServerClient(session.accessToken);
  const teamId = await getActiveTeamId(session);
  const taskResult = await client
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("team_id", teamId)
    .single<TaskRow>();

  if (taskResult.error || !taskResult.data) {
    throw new Error(taskResult.error?.message || "Task not found in your workspace.");
  }

  return taskResult.data;
}

async function validateAssigneeBelongsToTeam(
  session: SessionUser,
  teamId: string,
  assigneeId: string
): Promise<void> {
  const client = createSupabaseServerClient(session.accessToken);

  const assigneeResult = await client
    .from("team_members")
    .select("profile_id")
    .eq("team_id", teamId)
    .eq("profile_id", assigneeId)
    .maybeSingle();

  if (assigneeResult.error) {
    throw new Error(`Could not validate assignee: ${assigneeResult.error.message}`);
  }

  if (!assigneeResult.data) {
    throw new Error("Selected assignee is not a member of this team.");
  }
}

export const supabaseProvider: DataProvider = {
  async getWorkspace(session) {
    return getWorkspaceData(session);
  },

  async updateTaskStatus(session, taskId, status) {
    await ensureTaskBelongsToTeam(session, taskId);
    const client = createSupabaseServerClient(session.accessToken);

    const updateResult = await client
      .from("tasks")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select("*")
      .single<TaskRow>();

    if (updateResult.error || !updateResult.data) {
      throw new Error(updateResult.error?.message || "Could not update task status.");
    }

    return mapTaskRow(updateResult.data);
  },

  async assignTask(session, taskId, assigneeId) {
    const task = await ensureTaskBelongsToTeam(session, taskId);
    const client = createSupabaseServerClient(session.accessToken);

    if (assigneeId && task.voting_required && !task.voting_closed) {
      throw new Error("Complete voting before assigning this task.");
    }

    if (assigneeId) {
      await validateAssigneeBelongsToTeam(session, task.team_id, assigneeId);
    }

    const updateResult = await client
      .from("tasks")
      .update({ assignee_id: assigneeId, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select("*")
      .single<TaskRow>();

    if (updateResult.error || !updateResult.data) {
      throw new Error(updateResult.error?.message || "Could not update task assignee.");
    }

    return mapTaskRow(updateResult.data);
  },

  async createTask(session, input) {
    const client = createSupabaseServerClient(session.accessToken);
    const teamId = await getActiveTeamId(session);

    const insertResult = await client
      .from("tasks")
      .insert({
        id: `task-${crypto.randomUUID()}`,
        team_id: teamId,
        title: input.title,
        description: input.description,
        status: "backlog",
        priority: input.priority,
        tags: input.tags,
        due_date: toDayOnly(input.dueDate),
        assignee_id: null,
        voting_required: input.votingRequired,
        voting_closed: !input.votingRequired,
        official_story_points: null,
        created_by: session.id,
        updated_at: new Date().toISOString()
      })
      .select("*")
      .single<TaskRow>();

    if (insertResult.error || !insertResult.data) {
      throw new Error(insertResult.error?.message || "Could not create task.");
    }

    return mapTaskRow(insertResult.data);
  },

  async submitVote(session, input) {
    const task = await ensureTaskBelongsToTeam(session, input.taskId);
    const client = createSupabaseServerClient(session.accessToken);

    if (!task.voting_required) {
      throw new Error("Voting is not required for this task.");
    }

    const voteResult = await client.from("task_votes").upsert(
      {
        task_id: input.taskId,
        member_id: input.memberId,
        vote_value: input.value,
        created_at: new Date().toISOString()
      },
      { onConflict: "task_id,member_id" }
    );

    if (voteResult.error) {
      throw new Error(`Could not save vote: ${voteResult.error.message}`);
    }

    const votesResult = await client
      .from("task_votes")
      .select("*")
      .eq("task_id", input.taskId)
      .returns<VoteRow[]>();

    if (votesResult.error) {
      throw new Error(`Could not load votes: ${votesResult.error.message}`);
    }

    const membersResult = await client
      .from("team_members")
      .select("profile_id")
      .eq("team_id", task.team_id);

    if (membersResult.error) {
      throw new Error(`Could not load team members: ${membersResult.error.message}`);
    }

    const votes = votesResult.data || [];
    const memberCount = membersResult.data?.length ?? 0;

    const shouldCloseVoting = memberCount > 0 && votes.length >= memberCount;
    const average = shouldCloseVoting
      ? Number((votes.reduce((sum, vote) => sum + vote.vote_value, 0) / votes.length).toFixed(1))
      : null;

    const taskUpdateResult = await client
      .from("tasks")
      .update({
        voting_closed: shouldCloseVoting,
        official_story_points: average,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.taskId);

    if (taskUpdateResult.error) {
      throw new Error(`Could not update task voting status: ${taskUpdateResult.error.message}`);
    }

    return votes.map((vote) => ({
      id: vote.id,
      taskId: vote.task_id,
      memberId: vote.member_id,
      value: vote.vote_value,
      createdAt: vote.created_at
    }));
  },

  async addComment(session, input: CommentInput) {
    await ensureTaskBelongsToTeam(session, input.taskId);
    const client = createSupabaseServerClient(session.accessToken);

    const insertResult = await client
      .from("comments")
      .insert({
        task_id: input.taskId,
        member_id: input.memberId,
        body: input.message,
        created_at: new Date().toISOString()
      })
      .select("*")
      .single<CommentRow>();

    if (insertResult.error || !insertResult.data) {
      throw new Error(insertResult.error?.message || "Could not post comment.");
    }

    const comment = insertResult.data;

    await client
      .from("tasks")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", input.taskId);

    return {
      id: comment.id,
      taskId: comment.task_id,
      memberId: comment.member_id,
      message: comment.body,
      createdAt: comment.created_at
    };
  },

  async listTeams(session) {
    return listMemberships(session);
  },

  async createTeam(session, input: CreateTeamInput) {
    await ensureProfileExists(session);
    const client = createSupabaseServerClient(session.accessToken);

    const teamId = `team-${crypto.randomUUID()}`;

    const createTeamResult = await client
      .from("teams")
      .insert({
        id: teamId,
        name: input.name,
        project_name: input.projectName,
        created_by: session.id
      })
      .select("id, name, project_name")
      .single<TeamRow>();

    if (createTeamResult.error || !createTeamResult.data) {
      throw new Error(createTeamResult.error?.message || "Could not create team.");
    }

    const memberInsertResult = await client.from("team_members").insert({
      team_id: teamId,
      profile_id: session.id,
      member_role: "owner"
    });

    if (memberInsertResult.error) {
      throw new Error(`Could not create team membership: ${memberInsertResult.error.message}`);
    }

    return {
      teamId,
      teamName: createTeamResult.data.name,
      projectName: createTeamResult.data.project_name,
      memberRole: "owner",
      joinedAt: new Date().toISOString()
    };
  },

  async joinTeam(session, input: JoinTeamInput) {
    await ensureProfileExists(session);
    const client = createSupabaseServerClient(session.accessToken);
    const teamCode = input.teamCode.trim();

    if (!teamCode) {
      throw new Error("Team code is required.");
    }

    const membershipInsertResult = await client.from("team_members").upsert(
      {
        team_id: teamCode,
        profile_id: session.id,
        member_role: "member"
      },
      {
        onConflict: "team_id,profile_id",
        ignoreDuplicates: true
      }
    );

    if (membershipInsertResult.error) {
      if (membershipInsertResult.error.code === "23503") {
        throw new Error("Team code not found. Ask your teammate for the exact code.");
      }
      throw new Error(`Could not join team: ${membershipInsertResult.error.message}`);
    }

    const joinedTeamResult = await client
      .from("teams")
      .select("id, name, project_name")
      .eq("id", teamCode)
      .single<TeamRow>();

    if (joinedTeamResult.error || !joinedTeamResult.data) {
      throw new Error(joinedTeamResult.error?.message || "Team code not found.");
    }

    return {
      teamId: joinedTeamResult.data.id,
      teamName: joinedTeamResult.data.name,
      projectName: joinedTeamResult.data.project_name,
      memberRole: "member",
      joinedAt: new Date().toISOString()
    };
  }
};
