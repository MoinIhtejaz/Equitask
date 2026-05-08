import { redirect } from "next/navigation";

import { getCurrentSession } from "@/services/authService";
import { SessionUser } from "@/types";

export function requireWorkspaceSession(): SessionUser {
  const session = getCurrentSession();
  if (!session || session.mode !== "supabase") {
    redirect("/sign-in");
  }

  return session;
}

export function requireTeamSession(): SessionUser {
  const session = requireWorkspaceSession();

  if (session.mode === "supabase" && !session.teamId) {
    redirect("/dashboard");
  }

  return session;
}
