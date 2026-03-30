"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TeamMembership } from "@/types";

export function FinalizeTeamPanel({ teams }: { teams: TeamMembership[] }) {
  const router = useRouter();
  const [joinTeamName, setJoinTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function joinTeam() {
    try {
      setIsBusy(true);
      setError(null);

      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName: joinTeamName })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not join team.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not join team.");
    } finally {
      setIsBusy(false);
    }
  }

  async function activateTeam(teamId: string) {
    try {
      setIsBusy(true);
      setError(null);

      const response = await fetch("/api/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not activate team.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not activate team.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="relative space-y-6 overflow-hidden border-dashed border-[#c39a5f]/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,242,228,0.9))]">
      <div className="absolute inset-y-0 right-0 w-56 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_70%)]" />
      <div>
        <p className="section-kicker">Finalize Team</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink">Finish your team setup from the dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Join the existing team workspace by name, or activate a team you already belong to. Once a team is
          selected, analytics and scrum data load for the whole group.
        </p>
      </div>

      {error ? <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      {teams.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Available teams</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {teams.map((team) => (
              <div key={team.teamId} className="rounded-[24px] border border-[#e1d4be] bg-white/70 p-5">
                <p className="text-lg font-semibold text-slate-800">{team.teamName}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{team.projectName}</p>
                <Button
                  className="mt-4"
                  variant="secondary"
                  disabled={isBusy}
                  onClick={() => activateTeam(team.teamId)}
                >
                  Open Team Workspace
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[26px] border border-[#e1d4be] bg-white/[0.72] p-5">
        <h3 className="text-xl font-semibold text-ink">Join with team name</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter the exact team name so you join the shared analytics and scrum workspace.
        </p>
        <div className="mt-4 space-y-3">
          <Input
            value={joinTeamName}
            onChange={(event) => setJoinTeamName(event.target.value)}
            placeholder="team 05"
          />
          <Button className="w-full" disabled={isBusy || !joinTeamName.trim()} onClick={joinTeam}>
            {isBusy ? "Joining..." : "Join Team"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
