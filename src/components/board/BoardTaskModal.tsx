"use client";

import { Avatar } from "@/components/shared/Avatar";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VotingBreakdown } from "@/components/voting/VotingBreakdown";
import { formatDate } from "@/lib/utils";
import { Member, Task, TaskVote } from "@/types";

export function BoardTaskModal({
  task,
  members,
  votes,
  onClose
}: {
  task: Task;
  members: Member[];
  votes: TaskVote[];
  onClose: () => void;
}) {
  const assignee = members.find((member) => member.id === task.assigneeId) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/[0.45] px-4 py-8 backdrop-blur-sm">
      <div className="lux-surface max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] p-7 shadow-[0_32px_90px_-40px_rgba(17,20,26,0.7)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-kicker">Task window</p>
            <h2 className="mt-3 text-4xl font-semibold text-ink">{task.title}</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <p className="mt-5 text-base leading-8 text-slate-600">{task.description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Due date</p>
            <p className="mt-3 text-xl font-semibold text-ink">{formatDate(task.dueDate)}</p>
          </div>
          <div className="rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Status</p>
            <p className="mt-3 text-xl font-semibold capitalize text-ink">{task.status.replace("_", " ")}</p>
          </div>
          <div className="rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assignee</p>
            <div className="mt-3 flex items-center gap-2">
              {assignee ? <Avatar member={assignee} size="sm" /> : null}
              <p className="text-xl font-semibold text-ink">{assignee?.name ?? "Unassigned"}</p>
            </div>
          </div>
        </div>

        {task.votingRequired && task.votingClosed ? (
          <div className="mt-6">
            <VotingBreakdown task={task} members={members} votes={votes} />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4 text-sm leading-7 text-slate-600">
            This task did not need a completed vote reveal.
          </div>
        )}
      </div>
    </div>
  );
}
