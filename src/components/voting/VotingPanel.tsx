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

      if (Array.isArray(payload.votes) && payload.votes.length >= members.length) {
        await fetch(`/api/tasks/${task.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "backlog" })
        });
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
  const revealVotes = task.votingClosed;

  return (
    <Card className="space-y-6 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">Private estimation</p>
          <h3 className="mt-3 text-2xl font-semibold text-ink">Story Point Voting</h3>
        </div>
        <Badge className="w-fit border-[#171d25] bg-[#171d25] text-white">
          {insight.votedMemberIds.length}/{members.length} voted
        </Badge>
      </div>

      <div className="rounded-[24px] border border-[#e2d6c3] bg-white/[0.65] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Completion</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{completionPercentage}%</p>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {insight.missingMemberIds.length} member(s) still need to vote.
          </p>
        </div>
        <div className="mt-4 space-y-3">
        <ProgressBar value={completionPercentage} />
        {!revealVotes ? (
            <p className="text-sm font-medium leading-6 text-slate-600">
            Vote values stay hidden until the full team has submitted.
          </p>
        ) : null}
        </div>
      </div>

      {error ? <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      {mode === "demo" ? (
        <div className="max-w-xs">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Vote as</p>
          <Select value={voteAs} onChange={(event) => setVoteAs(event.target.value)}>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {VOTE_OPTIONS.map((option) => (
          <Button
            key={option}
            variant={activeVote === option ? "primary" : "ghost"}
            className="h-14 text-lg"
            disabled={isSaving}
            onClick={() => castVote(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[24px] border border-[#e2d6c3] bg-white/[0.65] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Average score</p>
          <p className="mt-3 text-2xl font-semibold text-ink">
            {revealVotes ? insight.average ?? "Pending" : "Hidden until reveal"}
          </p>
        </div>
        <div className="rounded-[24px] border border-[#e2d6c3] bg-white/[0.65] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Disagreement range</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{revealVotes ? insight.disagreement : "Hidden"}</p>
        </div>
      </div>

      {revealVotes && insight.isStrongDisagreement ? (
        <p className="rounded-[24px] bg-amber-100 p-4 text-sm leading-7 text-amber-800">
          Strong disagreement detected. Consider a short clarification discussion before assignment.
        </p>
      ) : revealVotes ? (
        <p className="rounded-[24px] bg-emerald-100 p-4 text-sm leading-7 text-emerald-800">
          Voting is fairly aligned. The average can be used as the official effort estimate.
        </p>
      ) : (
        <p className="rounded-[24px] bg-sky-100 p-4 text-sm leading-7 text-sky-800">
          Voting stays private until everyone has voted, so the group is not influenced early.
        </p>
      )}

      <div className="space-y-3 text-sm">
        {members.map((member) => {
          const memberVote = votes.find((vote) => vote.memberId === member.id);
          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-[22px] border border-[#e2d6c3] bg-white/60 px-4 py-3"
            >
              <span className="font-medium text-slate-700">{member.name}</span>
              <span className="font-semibold text-slate-700">
                {revealVotes
                  ? memberVote?.value ?? "No vote"
                  : memberVote
                    ? member.id === activeVoterId
                      ? `You picked ${memberVote.value}`
                      : "Submitted"
                    : "Waiting"}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
