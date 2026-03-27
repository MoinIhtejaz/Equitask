"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
}

export function VotingPanel({ task, members, votes, currentUserId, mode }: VotingPanelProps) {
  const router = useRouter();
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
      router.refresh();
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

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">Story Point Voting</h3>
        <Badge>{insight.votedMemberIds.length}/{members.length} voted</Badge>
      </div>

      <div className="space-y-2">
        <ProgressBar value={completionPercentage} />
        <p className="text-xs text-slate-500">
          {completionPercentage}% completion. {insight.missingMemberIds.length} member(s) still need to vote.
        </p>
      </div>

      {error ? <p className="rounded-xl bg-rose-100 p-2 text-sm text-rose-700">{error}</p> : null}

      {mode === "demo" ? (
        <div className="max-w-xs">
          <p className="mb-1 text-xs text-slate-500">Vote as</p>
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
            disabled={isSaving}
            onClick={() => castVote(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Average score</p>
          <p className="text-xl font-semibold text-ink">{insight.average ?? "Pending"}</p>
        </div>
        <div>
          <p className="text-slate-500">Disagreement range</p>
          <p className="text-xl font-semibold text-ink">{insight.disagreement}</p>
        </div>
      </div>

      {insight.isStrongDisagreement ? (
        <p className="rounded-xl bg-amber-100 p-2 text-sm text-amber-800">
          Strong disagreement detected. Consider a short clarification discussion before assignment.
        </p>
      ) : (
        <p className="rounded-xl bg-emerald-100 p-2 text-sm text-emerald-800">
          Voting is fairly aligned. The average can be used as the official effort estimate.
        </p>
      )}

      <div className="space-y-2 text-sm">
        {members.map((member) => {
          const memberVote = votes.find((vote) => vote.memberId === member.id);
          return (
            <div key={member.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-2">
              <span>{member.name}</span>
              <span className="font-semibold text-slate-700">{memberVote ? memberVote.value : "No vote yet"}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
