"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/shared/Avatar";
import { BoardTaskModal } from "@/components/board/BoardTaskModal";
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

function getBoardStatus(task: Task): TaskStatus {
  if (task.votingRequired && task.votingClosed && !task.assigneeId) {
    return "backlog";
  }

  return task.status;
}

export function BoardClient({ tasks, members, votes }: BoardClientProps) {
  const router = useRouter();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const visibleTasks = tasks.filter((task) => !task.votingRequired || task.votingClosed);
  const selectedTask = visibleTasks.find((task) => task.id === selectedTaskId) ?? null;

  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const memberPoints = useMemo(() => {
    return visibleTasks.reduce<Record<string, number>>((accumulator, task) => {
      if (!task.assigneeId) {
        return accumulator;
      }

      accumulator[task.assigneeId] =
        (accumulator[task.assigneeId] ?? 0) + (task.officialStoryPoints ?? 0);
      return accumulator;
    }, {});
  }, [visibleTasks]);

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
    <div className="space-y-5">
      {error ? <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[1380px] gap-5 xl:grid-cols-5">
        {STATUS_ORDER.map((status) => {
          const columnTasks = visibleTasks.filter((task) => getBoardStatus(task) === status);

          return (
            <section
              key={status}
              className="rounded-[28px] border border-[#e3d8c5] bg-white/[0.58] p-4 shadow-[0_24px_60px_-42px_rgba(17,20,26,0.28)] backdrop-blur"
            >
              <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="section-kicker">Column</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-700">{STATUS_LABELS[status]}</h3>
                </div>
                <Badge className="border-[#171d25] bg-[#171d25] text-white">{columnTasks.length}</Badge>
              </header>

              <div className="space-y-4">
                {columnTasks.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-[#d4c4a5] bg-white/[0.4] px-4 py-8 text-center text-sm text-slate-500">
                    No tasks in {STATUS_LABELS[status].toLowerCase()} yet.
                  </div>
                ) : null}
                {columnTasks.map((task) => {
                  const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
                  const votingInsight = getVotingInsight(
                    task,
                    members.map((member) => member.id),
                    votes
                  );

                  return (
                    <Card
                      key={task.id}
                      className="cursor-pointer space-y-4 border border-[#ece3d3] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(249,243,233,0.92))] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#c39a5f] hover:shadow-[0_24px_60px_-34px_rgba(17,20,26,0.35)]"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          className="text-left text-sm font-semibold text-slate-800 underline-offset-2 hover:underline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTaskId(task.id);
                          }}
                        >
                          {task.title}
                        </button>
                        <PriorityBadge priority={task.priority} />
                      </div>

                      <p className="text-sm leading-6 text-slate-600">{task.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                        <div className="rounded-2xl border border-[#eadfcd] bg-white/[0.55] p-3">
                          <p className="uppercase tracking-[0.18em] text-slate-500">Due</p>
                          <p className="mt-2 text-sm font-semibold text-ink">{formatDate(task.dueDate)}</p>
                        </div>
                        <div className="rounded-2xl border border-[#eadfcd] bg-white/[0.55] p-3">
                          <p className="uppercase tracking-[0.18em] text-slate-500">Points</p>
                          <p className="mt-2 text-sm font-semibold text-ink">{task.officialStoryPoints ?? "Pending"}</p>
                        </div>
                        <div className="rounded-2xl border border-[#eadfcd] bg-white/[0.55] p-3">
                          <p className="uppercase tracking-[0.18em] text-slate-500">Voting</p>
                          <p className="mt-2 text-sm font-semibold text-ink">
                            {votingInsight.votedMemberIds.length}/{members.length}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[#eadfcd] bg-white/[0.55] p-3">
                          <p className="uppercase tracking-[0.18em] text-slate-500">Fit</p>
                          <p className="mt-2 text-sm font-semibold text-ink">{getWorkloadFit(task, memberPoints, averagePoints)}</p>
                        </div>
                      </div>

                      {assignee ? (
                        <div className="flex items-center gap-2 rounded-[20px] border border-[#eadfcd] bg-white/[0.55] p-3">
                          <Avatar member={assignee} size="sm" />
                          <span className="text-sm font-medium text-slate-700">{assignee.name}</span>
                        </div>
                      ) : null}

                      <div
                        className="space-y-2"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Select
                          value={getBoardStatus(task)}
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
                          disabled={busyTaskId === task.id}
                          onChange={(event) => updateAssignee(task.id, event.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </Select>
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

      {selectedTask ? (
        <BoardTaskModal
          task={selectedTask}
          members={members}
          votes={votes.filter((vote) => vote.taskId === selectedTask.id)}
          onClose={() => setSelectedTaskId(null)}
        />
      ) : null}
    </div>
  );
}
