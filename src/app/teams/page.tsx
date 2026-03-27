import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { TeamHubClient } from "@/components/teams/TeamHubClient";
import { getCurrentSession } from "@/services/authService";
import { listTeams } from "@/services/teamService";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const session = getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.mode === "demo") {
    redirect("/dashboard");
  }

  const teams = await listTeams(session);

  return (
    <AppShell session={session}>
      <TeamHubClient session={session} teams={teams} />
    </AppShell>
  );
}
