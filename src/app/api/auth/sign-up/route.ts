import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { signUpWithSupabase } from "@/services/authService";
import { hydrateSessionWithActiveTeam, joinTeam } from "@/services/teamService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "").trim();
    const teamName = String(body.teamName || "").trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (!teamName) {
      return NextResponse.json(
        { success: false, error: "Team name is required." },
        { status: 400 }
      );
    }

    const result = await signUpWithSupabase(name, email, password);

    let session = result.session;
    let message = result.message;
    let teamWarning: string | null = null;

    if (session) {
      try {
        const joined = await joinTeam(session, { teamName });
        session = await hydrateSessionWithActiveTeam(session, joined.teamId);
      } catch (teamError) {
        session = await hydrateSessionWithActiveTeam(session);
        teamWarning =
          teamError instanceof Error
            ? teamError.message
            : "Account created, but we could not attach you to the team workspace.";
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
      redirectTo: "/dashboard"
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
