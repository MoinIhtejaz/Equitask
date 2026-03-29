import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { signInWithSupabase } from "@/services/authService";
import { hydrateSessionWithActiveTeam } from "@/services/teamService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const session = await signInWithSupabase(email, password);
    const hydratedSession = await hydrateSessionWithActiveTeam(session);

    const hasTeam = Boolean(hydratedSession.teamId);
    const response = NextResponse.json({
      success: true,
      mode: "supabase",
      hasTeam,
      redirectTo: "/dashboard"
    });
    setSession(response, hydratedSession);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to sign in."
      },
      { status: 400 }
    );
  }
}
