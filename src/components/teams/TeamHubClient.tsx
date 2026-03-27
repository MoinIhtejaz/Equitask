"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SessionUser, TeamMembership } from "@/types";

interface TeamHubClientProps {
  session: SessionUser;
  teams: TeamMembership[];
}

export function TeamHubClient({ session, teams }: TeamHubClientProps) {
  const router = useRouter();
  const [activeTeamId, setActiveTeamId] = useState(session.teamId ?? null);
  const [createName, setCreateName] = useState("");
  const [createProjectName, setCreateProjectName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function createNewTeam() {
    try {
      setIsBusy(true);
      setError(null);

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          projectName: createProjectName
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not create team.");
      }

      setActiveTeamId(payload.activeTeamId);
      setCreateName("");
      setCreateProjectName("");
      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create team.");
    } finally {
      setIsBusy(false);
    }
  }

  async function joinExistingTeam() {
    try {
      setIsBusy(true);
      setError(null);

      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamCode: joinCode })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not join team.");
      }

      setActiveTeamId(payload.activeTeamId);
      setJoinCode("");
      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not join team.");
    } finally {
      setIsBusy(false);
    }
  }

  async function switchTeam(teamId: string) {
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
        throw new Error(payload.error || "Could not switch team.");
      }

      setActiveTeamId(teamId);
      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not switch team.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Team Hub</h1>
        <p className="mt-1 text-slate-600">
          Create a team, join with a team code, and choose which team workspace to open.
        </p>
      </Card>

      {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Create Team</h2>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Team name
            </label>
            <Input
              placeholder="Team Equitask Alpha"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Project name
            </label>
            <Input
              placeholder="Equitask Student Collaboration Platform"
              value={createProjectName}
              onChange={(event) => setCreateProjectName(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={isBusy || !createName.trim() || !createProjectName.trim()}
            onClick={createNewTeam}
          >
            {isBusy ? "Creating..." : "Create Team"}
          </Button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-ink">Join Team</h2>
          <p className="text-sm text-slate-600">
            Paste the team code shared by one of your teammates.
          </p>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Team code
            </label>
            <Input
              placeholder="team-xxxxxxxx"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value)}
            />
          </div>
          <Button className="w-full" disabled={isBusy || !joinCode.trim()} onClick={joinExistingTeam}>
            {isBusy ? "Joining..." : "Join Team"}
          </Button>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold text-ink">Your Teams</h2>
        <div className="space-y-3">
          {teams.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
              You are not in a team yet. Create one or join with a team code to continue.
            </p>
          ) : (
            teams.map((team) => (
              <div key={team.teamId} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{team.teamName}</p>
                    <p className="text-sm text-slate-600">Project: {team.projectName}</p>
                    <p className="mt-1 text-xs text-slate-500">Team code: {team.teamId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTeamId === team.teamId ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        disabled={isBusy}
                        onClick={() => switchTeam(team.teamId)}
                      >
                        Open Team
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
