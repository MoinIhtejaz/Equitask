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
      <Card className="relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.18),transparent_72%)]" />
        <p className="section-kicker">Team Management</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-ink">
          {activeTeamName ?? "Join your team workspace"}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {activeTeamName
            ? `${activeProjectName ?? "Project workspace"} is active. Manage members, switch teams, and launch new work from here.`
            : "Join an existing team by exact name or create a team workspace before opening analytics, voting, and scrum execution."}
        </p>
      </Card>

      {error ? <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-5 xl:grid-cols-[1fr,1fr]">
        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Join Team</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Enter a team name</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Use the exact team name your group created, for example "team 05".
            </p>
          </div>
          <Input
            value={joinTeamName}
            onChange={(event) => setJoinTeamName(event.target.value)}
            placeholder="team 05"
          />
          <Button className="w-full" disabled={isBusy || !joinTeamName.trim()} onClick={joinTeam}>
            {isBusy ? "Working..." : "Join Team"}
          </Button>
        </Card>

        <Card className="space-y-4">
          <div>
            <p className="section-kicker">Create Team</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink">Launch a workspace</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Create a team if your group does not already have one.
            </p>
          </div>
          <Input
            value={newTeamName}
            onChange={(event) => setNewTeamName(event.target.value)}
            placeholder="team 05"
          />
          <Input
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="Equitask Student Collaboration Platform"
          />
          <Button
            className="w-full"
            variant="secondary"
            disabled={isBusy || !newTeamName.trim() || !newProjectName.trim()}
            onClick={createTeam}
          >
            {isBusy ? "Working..." : "Create Team"}
          </Button>
        </Card>
      </div>

      {teams.length > 0 ? (
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-kicker">Your Teams</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">Available workspaces</h2>
            </div>
            <span className="rounded-full border border-[#e2d7c3] bg-white/[0.65] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {teams.length} joined
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {teams.map((team) => {
              const isActive = team.teamId === activeTeamId;

              return (
                <div
                  key={team.teamId}
                  className="rounded-[24px] border border-[#e1d4be] bg-white/70 p-5"
                >
                  <p className="text-lg font-semibold text-slate-800">{team.teamName}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{team.projectName}</p>
                  <Button
                    className="mt-4"
                    variant={isActive ? "ghost" : "secondary"}
                    disabled={isBusy || isActive}
                    onClick={() => activateTeam(team.teamId)}
                  >
                    {isActive ? "Current Team" : "Open Team"}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {activeTeamId ? (
        <Card>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-kicker">Members</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink">Team members</h2>
            </div>
            <span className="rounded-full border border-[#e2d7c3] bg-white/[0.65] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {members.length} member{members.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {members.map((member) => (
              <div key={member.id} className="rounded-[24px] border border-[#e1d4be] bg-white/70 p-5">
                <div className="flex items-center gap-3">
                  <Avatar member={member} />
                  <div>
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{member.preferredWorkingStyle}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
