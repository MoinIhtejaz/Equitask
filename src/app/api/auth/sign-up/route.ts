import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { signUpWithSupabase } from "@/services/authService";
import { createTeam, hydrateSessionWithActiveTeam, joinTeam } from "@/services/teamService";

type TeamAction = "create" | "join" | "later";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "").trim();
    const teamAction = String(body.teamAction || "create").trim() as TeamAction;
    const teamName = String(body.teamName || "").trim();
    const projectName = String(body.projectName || "").trim();
    const teamCode = String(body.teamCode || "").trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!["create", "join", "later"].includes(teamAction)) {
      return NextResponse.json(
        { success: false, error: "Invalid team action." },
        { status: 400 }
      );
    }

    if (teamAction === "create" && (!teamName || !projectName)) {
      return NextResponse.json(
        { success: false, error: "Team name and project name are required to create a team." },
        { status: 400 }
      );
    }

    if (teamAction === "join" && !teamCode) {
      return NextResponse.json(
        { success: false, error: "Team code is required to join an existing team." },
        { status: 400 }
      );
    }

    const result = await signUpWithSupabase(name, email, password);

    let session = result.session;
    let message = result.message;
    let teamWarning: string | null = null;

    if (session) {
      try {
        if (teamAction === "create") {
          const created = await createTeam(session, {
            name: teamName,
            projectName
          });
          session = await hydrateSessionWithActiveTeam(session, created.teamId);
        } else if (teamAction === "join") {
          const joined = await joinTeam(session, { teamCode });
          session = await hydrateSessionWithActiveTeam(session, joined.teamId);
        } else {
          session = await hydrateSessionWithActiveTeam(session);
        }
      } catch (teamError) {
        session = await hydrateSessionWithActiveTeam(session);
        teamWarning =
          teamError instanceof Error
            ? teamError.message
            : "Account created, but team setup was not completed.";
      }
    }

    const hasTeam = Boolean(session?.teamId);
    const response = NextResponse.json({
      success: true,
      mode: "supabase",
      message,
      teamWarning,
      needsEmailVerification: !session,
      hasTeam,
      redirectTo: hasTeam ? "/dashboard" : "/teams"
    });

    if (session) {
      setSession(response, session);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to sign up."
      },
      { status: 400 }
    );
  }
}
