import { getDataProvider } from "@/data/providers/providerFactory";
import { CreateTeamInput, JoinTeamInput } from "@/data/providers/providerTypes";
import { SessionUser, TeamMembership } from "@/types";

function pickActiveTeam(
  teams: TeamMembership[],
  preferredTeamId?: string
): TeamMembership | undefined {
  if (!teams.length) {
    return undefined;
  }

  if (preferredTeamId) {
    const explicitTeam = teams.find((team) => team.teamId === preferredTeamId);
    if (explicitTeam) {
      return explicitTeam;
    }
  }

  return teams[0];
}

export async function listTeams(session: SessionUser): Promise<TeamMembership[]> {
  const provider = getDataProvider(session);
  return provider.listTeams(session);
}

export async function createTeam(session: SessionUser, input: CreateTeamInput): Promise<TeamMembership> {
  const provider = getDataProvider(session);
  return provider.createTeam(session, input);
}

export async function joinTeam(session: SessionUser, input: JoinTeamInput): Promise<TeamMembership> {
  const provider = getDataProvider(session);
  return provider.joinTeam(session, input);
}

export async function hydrateSessionWithActiveTeam(
  session: SessionUser,
  preferredTeamId?: string
): Promise<SessionUser> {
  if (session.mode === "demo") {
    return {
      ...session,
      teamId: session.teamId ?? "team-alpha",
      teamName: session.teamName ?? "Team Equitask Alpha",
      projectName: session.projectName ?? "Equitask Student Collaboration Platform"
    };
  }

  if (!session.accessToken) {
    return session;
  }

  const teams = await listTeams(session);
  const activeTeam = pickActiveTeam(teams, preferredTeamId ?? session.teamId);

  if (!activeTeam) {
    const { teamId, teamName, projectName, ...rest } = session;
    return rest;
  }

  return {
    ...session,
    teamId: activeTeam.teamId,
    teamName: activeTeam.teamName,
    projectName: activeTeam.projectName
  };
}
