"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";
import { VOTE_OPTIONS } from "@/lib/constants";
import { Member, Task, TaskVote, VoteValue } from "@/types";
import { getVotingInsight } from "@/services/voteService";

interface VotingPanelProps {
  task: Task;
  members: Member[];
  votes: TaskVote[];
  currentUserId: string;
  mode: "demo" | "supabase";
  onVoted?: () => void;
}

export function VotingPanel({ task, members, votes, currentUserId, mode, onVoted }: VotingPanelProps) {
  const [voteAs, setVoteAs] = useState(currentUserId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insight = getVotingInsight(
    task,
    members.map((member) => member.id),
    votes
  );

  async function castVote(value: VoteValue) {
    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`/api/tasks/${task.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, memberId: mode === "demo" ? voteAs : undefined })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not save vote.");
      }

      if (Array.isArray(payload.votes) && payload.votes.length >= members.length) {
        await fetch(`/api/tasks/${task.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "backlog" })
        });
      }

      onVoted?.();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save vote.");
    } finally {
      setIsSaving(false);
    }
  }

  const activeVoterId = mode === "demo" ? voteAs : currentUserId;
  const activeVote = votes.find((vote) => vote.memberId === activeVoterId)?.value;
  const completionPercentage = members.length
    ? Math.round((insight.votedMemberIds.length / members.length) * 100)
    : 0;
  const revealVotes = task.votingClosed;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Voting</h3>
        <Badge>{insight.votedMemberIds.length}/{members.length}</Badge>
      </div>

      <div>
        <ProgressBar value={completionPercentage} />
        <p className="mt-2 text-xs text-slate-500">
          {completionPercentage}% complete
          {!revealVotes ? " • Votes hidden until everyone submits" : ""}
        </p>
      </div>

      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

      {mode === "demo" ? (
        <div className="max-w-xs">
          <label className="mb-1 block text-xs text-slate-500">Vote as</label>
          <Select value={voteAs} onChange={(event) => setVoteAs(event.target.value)}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {VOTE_OPTIONS.map((option) => (
          <Button
            key={option}
            variant={activeVote === option ? "primary" : "secondary"}
            className="h-10"
            disabled={isSaving}
            onClick={() => castVote(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Average</p>
          <p className="font-medium text-ink">
            {revealVotes ? insight.average ?? "Pending" : "Hidden"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Disagreement</p>
          <p className="font-medium text-ink">{revealVotes ? insight.disagreement : "Hidden"}</p>
        </div>
      </div>

      {revealVotes && insight.isStrongDisagreement ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Strong disagreement — discuss before assignment.
        </p>
      ) : null}

      <ul className="divide-y divide-slate-100 text-sm">
        {members.map((member) => {
          const memberVote = votes.find((vote) => vote.memberId === member.id);
          return (
            <li key={member.id} className="flex items-center justify-between py-2">
              <span className="text-slate-700">{member.name}</span>
              <span className="text-slate-600">
                {revealVotes
                  ? memberVote?.value ?? "—"
                  : memberVote
                    ? member.id === activeVoterId
                      ? `You: ${memberVote.value}`
                      : "Submitted"
                    : "Waiting"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
