import { redirect } from "next/navigation";

import { getCurrentSession } from "@/services/authService";
import { SessionUser } from "@/types";

export function requireWorkspaceSession(): SessionUser {
  const session = getCurrentSession();
  if (!session) {
    redirect("/sign-in");
  }

  if (session.mode === "supabase" && !session.teamId) {
    redirect("/teams");
  }

  return session;
}
