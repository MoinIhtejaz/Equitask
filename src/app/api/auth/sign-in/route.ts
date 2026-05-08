import { NextResponse } from "next/server";

import { getPasswordValidationError } from "@/lib/security/password";
import { setSession } from "@/lib/auth/session";
import { signInWithSupabase } from "@/services/authService";
import { hydrateSessionWithActiveTeam } from "@/services/teamService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || getPasswordValidationError(password)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
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
      redirectTo: hasTeam ? "/dashboard" : "/teams"
    });
    setSession(response, hydratedSession);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Invalid email or password."
      },
      { status: 400 }
    );
  }
}
