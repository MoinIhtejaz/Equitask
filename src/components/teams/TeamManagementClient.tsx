"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/shared/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Member, TeamMembership } from "@/types";

interface TeamManagementClientProps {
  teams: TeamMembership[];
  members: Member[];
  activeTeamId?: string;
  activeTeamName?: string;
  activeProjectName?: string;
}

export function TeamManagementClient({
  teams,
  members,
  activeTeamId,
  activeTeamName,
  activeProjectName
}: TeamManagementClientProps) {
  const router = useRouter();
  const [joinTeamName, setJoinTeamName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function submitRequest(url: string, method: "POST" | "PATCH", body: Record<string, string>) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Team action failed.");
    }
  }

  async function joinTeam() {
    try {
      setIsBusy(true);
      setError(null);
      await submitRequest("/api/teams/join", "POST", { teamName: joinTeamName });
      setJoinTeamName("");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not join team.");
    } finally {
      setIsBusy(false);
    }
  }

  async function createTeam() {
    try {
      setIsBusy(true);
      setError(null);
      await submitRequest("/api/teams", "POST", {
        name: newTeamName,
        projectName: newProjectName
      });
      setNewTeamName("");
      setNewProjectName("");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create team.");
    } finally {
      setIsBusy(false);
    }
  }

  async function activateTeam(teamId: string) {
    try {
      setIsBusy(true);
      setError(null);
      await submitRequest("/api/teams", "PATCH", { teamId });
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not open team.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          {activeTeamName ?? "Team Management"}
        </h1>
        {activeTeamName ? (
          <p className="mt-1 text-sm text-slate-500">{activeProjectName ?? "Project workspace"}</p>
        ) : (
          <p className="mt-1 text-sm text-slate-500">Join or create a team workspace.</p>
        )}
      </div>

      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-ink">Join Team</h2>
          <Input
            value={joinTeamName}
            onChange={(event) => setJoinTeamName(event.target.value)}
            placeholder="team 05"
          />
          <Button disabled={isBusy || !joinTeamName.trim()} onClick={joinTeam}>
            {isBusy ? "Working…" : "Join Team"}
          </Button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-ink">Create Team</h2>
          <Input
            value={newTeamName}
            onChange={(event) => setNewTeamName(event.target.value)}
            placeholder="team 05"
          />
          <Input
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="Project name"
          />
          <Button
            variant="secondary"
            disabled={isBusy || !newTeamName.trim() || !newProjectName.trim()}
            onClick={createTeam}
          >
            {isBusy ? "Working…" : "Create Team"}
          </Button>
        </Card>
      </div>

      {teams.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Your Teams</h2>
            <span className="text-xs text-slate-500">{teams.length}</span>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {teams.map((team) => {
              const isActive = team.teamId === activeTeamId;
              return (
                <div
                  key={team.teamId}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{team.teamName}</p>
                    <p className="truncate text-xs text-slate-500">{team.projectName}</p>
                  </div>
                  <Button
                    variant={isActive ? "ghost" : "secondary"}
                    disabled={isBusy || isActive}
                    onClick={() => activateTeam(team.teamId)}
                  >
                    {isActive ? "Active" : "Open"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {activeTeamId ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Members</h2>
            <span className="text-xs text-slate-500">{members.length}</span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {members.map((member) => (
              <div key={member.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <Avatar member={member} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{member.name}</p>
                    <p className="truncate text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-600">{member.preferredWorkingStyle}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
