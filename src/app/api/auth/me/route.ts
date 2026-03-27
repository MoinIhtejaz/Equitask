import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/mode";
import { getCurrentSession } from "@/services/authService";

export async function GET() {
  const session = getCurrentSession();

  if (!session) {
    return NextResponse.json({ authenticated: false, supabaseConfigured: isSupabaseConfigured() });
  }

  return NextResponse.json({
    authenticated: true,
    supabaseConfigured: isSupabaseConfigured(),
    user: {
      id: session.id,
      mode: session.mode,
      name: session.name,
      email: session.email,
      teamId: session.teamId,
      teamName: session.teamName,
      projectName: session.projectName
    }
  });
}
