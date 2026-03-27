"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Avatar } from "@/components/shared/Avatar";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Task, TaskStatus, TaskVote, Member } from "@/types";
import { getVotingInsight } from "@/services/voteService";

interface BoardClientProps {
  tasks: Task[];
  members: Member[];
  votes: TaskVote[];
}

function getWorkloadFit(task: Task, memberPoints: Record<string, number>, average: number): string {
  if (!task.assigneeId) {
    return "Unassigned";
  }

  const points = memberPoints[task.assigneeId] ?? 0;
  if (points > average * 1.3) {
    return "Overload risk";
  }
  if (points < average * 0.8) {
    return "Light capacity";
  }
  return "Balanced fit";
}

export function BoardClient({ tasks, members, votes }: BoardClientProps) {
  const router = useRouter();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const memberPoints = useMemo(() => {
    return tasks.reduce<Record<string, number>>((accumulator, task) => {
      if (!task.assigneeId) {
        return accumulator;
      }

      accumulator[task.assigneeId] =
        (accumulator[task.assigneeId] ?? 0) + (task.officialStoryPoints ?? 0);
      return accumulator;
    }, {});
  }, [tasks]);

  const averagePoints =
    members.length > 0
      ? members.reduce((sum, member) => sum + (memberPoints[member.id] ?? 0), 0) / members.length
      : 0;

  async function updateStatus(taskId: string, status: TaskStatus) {
    try {
      setBusyTaskId(taskId);
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not update task status.");
      }
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update task status.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function updateAssignee(taskId: string, assigneeId: string) {
    try {
      setBusyTaskId(taskId);
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: assigneeId || null })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not update task assignee.");
      }
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update task assignee.");
    } finally {
      setBusyTaskId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 xl:grid-cols-5">
        {STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <section key={status} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">{STATUS_LABELS[status]}</h3>
              <Badge>{columnTasks.length}</Badge>
            </header>

            <div className="space-y-3">
              {columnTasks.map((task) => {
                const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
                const votingInsight = getVotingInsight(
                  task,
                  members.map((member) => member.id),
                  votes
                );

                return (
                  <Card key={task.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-800">
                        <Link href={`/tasks/${task.id}`} className="underline-offset-2 hover:underline">
                          {task.title}
                        </Link>
                      </h4>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <p className="text-xs text-slate-600">{task.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <p>Due: {formatDate(task.dueDate)}</p>
                      <p>Points: {task.officialStoryPoints ?? "Pending"}</p>
                      <p>
                        Voting: {votingInsight.votedMemberIds.length}/{members.length}
                      </p>
                      <p>Fit: {getWorkloadFit(task, memberPoints, averagePoints)}</p>
                    </div>

                    {assignee ? (
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                        <Avatar member={assignee} size="sm" />
                        <span className="text-xs text-slate-700">{assignee.name}</span>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Select
                        value={task.status}
                        disabled={busyTaskId === task.id}
                        onChange={(event) => updateStatus(task.id, event.target.value as TaskStatus)}
                      >
                        {STATUS_ORDER.map((candidateStatus) => (
                          <option key={candidateStatus} value={candidateStatus}>
                            {STATUS_LABELS[candidateStatus]}
                          </option>
                        ))}
                      </Select>

                      <Select
                        value={task.assigneeId ?? ""}
                        disabled={
                          busyTaskId === task.id || (task.votingRequired && !task.votingClosed)
                        }
                        onChange={(event) => updateAssignee(task.id, event.target.value)}
                      >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </Select>
                      {task.votingRequired && !task.votingClosed ? (
                        <p className="text-xs text-amber-700">
                          Assignment locked until team voting closes.
                        </p>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        );
        })}
      </div>
    </div>
  );
}
