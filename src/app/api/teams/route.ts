import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { requireSession } from "@/services/authService";
import { createTeam, hydrateSessionWithActiveTeam, listTeams } from "@/services/teamService";

export async function GET() {
  try {
    const session = requireSession();
    const teams = await listTeams(session);
    return NextResponse.json({
      success: true,
      teams,
      activeTeamId: session.teamId ?? null
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not load teams."
      },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = requireSession();
    const body = await request.json();

    const name = String(body.name || "").trim();
    const projectName = String(body.projectName || "").trim();

    if (!name || !projectName) {
      return NextResponse.json(
        { success: false, error: "Team name and project name are required." },
        { status: 400 }
      );
    }

    const created = await createTeam(session, { name, projectName });
    const updatedSession = await hydrateSessionWithActiveTeam(session, created.teamId);

    const response = NextResponse.json({
      success: true,
      team: created,
      activeTeamId: created.teamId
    });

    setSession(response, updatedSession);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not create team."
      },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = requireSession();
    const body = await request.json();
    const teamId = String(body.teamId || "").trim();

    if (!teamId) {
      return NextResponse.json({ success: false, error: "Team id is required." }, { status: 400 });
    }

    const updatedSession = await hydrateSessionWithActiveTeam(session, teamId);

    if (!updatedSession.teamId || updatedSession.teamId !== teamId) {
      return NextResponse.json(
        { success: false, error: "You are not a member of this team." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true, activeTeamId: updatedSession.teamId });
    setSession(response, updatedSession);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not switch teams."
      },
      { status: 400 }
    );
  }
}
