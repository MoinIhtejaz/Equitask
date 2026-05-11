import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { DEMO_MEMBER_IDS } from "@/data/seed/demoData";

export async function POST() {
  const session = {
    id: DEMO_MEMBER_IDS.james,
    mode: "demo" as const,
    name: "James",
    teamId: "team-alpha",
    teamName: "Team Equitask Alpha",
    projectName: "Equitask Student Collaboration Platform"
  };

  const response = NextResponse.json({ success: true, redirectTo: "/dashboard" });
  setSession(response, session);
  return response;
}
