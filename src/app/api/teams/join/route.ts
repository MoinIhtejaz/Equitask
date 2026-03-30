import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { requireSession } from "@/services/authService";
import { hydrateSessionWithActiveTeam, joinTeam } from "@/services/teamService";

export async function POST(request: Request) {
  try {
    const session = requireSession();
    const body = await request.json();
    const teamCode = String(body.teamCode || "").trim();
    const teamName = String(body.teamName || "").trim();

    if (!teamCode && !teamName) {
      return NextResponse.json(
        { success: false, error: "Team name is required." },
        { status: 400 }
      );
    }

    const joined = await joinTeam(session, teamName ? { teamName } : { teamCode });
    const updatedSession = await hydrateSessionWithActiveTeam(session, joined.teamId);

    const response = NextResponse.json({
      success: true,
      team: joined,
      activeTeamId: joined.teamId
    });

    setSession(response, updatedSession);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not join team."
      },
      { status: 400 }
    );
  }
}
