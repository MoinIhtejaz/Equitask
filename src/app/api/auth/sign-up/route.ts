import { NextResponse } from "next/server";

import { getPasswordValidationError } from "@/lib/security/password";
import { setSession } from "@/lib/auth/session";
import { signUpWithSupabase } from "@/services/authService";
import { hydrateSessionWithActiveTeam } from "@/services/teamService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      return NextResponse.json({ success: false, error: passwordError }, { status: 400 });
    }

    const result = await signUpWithSupabase(name, email, password);

    let session = result.session;
    let message = result.message;

    if (session) {
      session = await hydrateSessionWithActiveTeam(session);
    }

    const hasTeam = Boolean(session?.teamId);
    const response = NextResponse.json({
      success: true,
      mode: "supabase",
      message,
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
