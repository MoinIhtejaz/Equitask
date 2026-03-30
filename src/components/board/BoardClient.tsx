"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/shared/Avatar";
import { BoardTaskModal } from "@/components/board/BoardTaskModal";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
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
  return task.status;
}

export function BoardClient({ tasks, members, votes }: BoardClientProps) {
  const router = useRouter();
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<TaskStatus | null>(null);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => !task.votingRequired || task.votingClosed),
    [tasks]
  );
  const [boardTasks, setBoardTasks] = useState<Task[]>(visibleTasks);

  useEffect(() => {
    setBoardTasks(visibleTasks);
  }, [visibleTasks]);

  const selectedTask = boardTasks.find((task) => task.id === selectedTaskId) ?? null;

  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const memberPoints = useMemo(() => {
    return boardTasks.reduce<Record<string, number>>((accumulator, task) => {
      if (!task.assigneeId) {
        return accumulator;
      }

      accumulator[task.assigneeId] =
        (accumulator[task.assigneeId] ?? 0) + (task.officialStoryPoints ?? 0);
      return accumulator;
    }, {});
  }, [boardTasks]);

  const averagePoints =
    members.length > 0
      ? members.reduce((sum, member) => sum + (memberPoints[member.id] ?? 0), 0) / members.length
      : 0;

  async function updateStatus(taskId: string, status: TaskStatus, optimistic = false) {
    const previousTasks = boardTasks;

    try {
      setBusyTaskId(taskId);
      setError(null);

      if (optimistic) {
        setBoardTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === taskId ? { ...task, status } : task))
        );
      }

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
      if (optimistic) {
        setBoardTasks(previousTasks);
      }
      setError(caughtError instanceof Error ? caughtError.message : "Could not update task status.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function updateAssignee(taskId: string, assigneeId: string) {
    const previousTasks = boardTasks;

    try {
      setBusyTaskId(taskId);
      setError(null);

      setBoardTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? { ...task, assigneeId: assigneeId || null } : task))
      );

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
      setBoardTasks(previousTasks);
      setError(caughtError instanceof Error ? caughtError.message : "Could not update task assignee.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function dropTaskIntoColumn(targetStatus: TaskStatus) {
    if (!draggedTaskId) {
      return;
    }

    const draggedTask = boardTasks.find((task) => task.id === draggedTaskId);
    setDropTargetStatus(null);

    if (!draggedTask) {
      setDraggedTaskId(null);
      return;
    }

    if (getBoardStatus(draggedTask) === targetStatus) {
      setDraggedTaskId(null);
      return;
    }

    await updateStatus(draggedTaskId, targetStatus, true);
    setDraggedTaskId(null);
  }

  return (
    <div className="space-y-5">
      {error ? <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[1380px] gap-5 xl:grid-cols-5">
          {STATUS_ORDER.map((status) => {
            const columnTasks = boardTasks.filter((task) => getBoardStatus(task) === status);
            const isDropActive = dropTargetStatus === status;

            return (
              <section
                key={status}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (draggedTaskId) {
                    event.dataTransfer.dropEffect = "move";
                    setDropTargetStatus(status);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void dropTaskIntoColumn(status);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDropTargetStatus(null);
                  }
                }}
                className={cn(
                  "rounded-[28px] border p-4 shadow-[0_24px_60px_-42px_rgba(17,20,26,0.28)] backdrop-blur transition-colors",
                  isDropActive
                    ? "border-[#c39a5f] bg-[#f7ecda]"
                    : "border-[#d8c7aa] bg-[#f8f1e4]/95"
                )}
              >
                <header className="mb-4 flex items-center justify-between gap-3 border-b border-[#dfcfb3] pb-3">
                  <h3 className="text-lg font-semibold text-ink">{STATUS_LABELS[status]}</h3>
                  <Badge className="border-[#1b222c] bg-[#1b222c] text-white">{columnTasks.length}</Badge>
                </header>

                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <div
                      className={cn(
                        "rounded-[22px] border border-dashed px-4 py-8 text-center text-sm font-medium transition-colors",
                        isDropActive
                          ? "border-[#c39a5f] bg-[#fff7eb] text-[#7c5a28]"
                          : "border-[#ceb88f] bg-[#fffaf1] text-slate-600"
                      )}
                    >
                      {draggedTaskId ? `Drop here to move into ${STATUS_LABELS[status]}.` : `No tasks in ${STATUS_LABELS[status].toLowerCase()} yet.`}
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
                        draggable={busyTaskId !== task.id}
                        onDragStart={(event) => {
                          setDraggedTaskId(task.id);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", task.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDropTargetStatus(null);
                        }}
                        className={cn(
                          "cursor-grab space-y-4 border border-[#dac6a3] bg-white p-4 shadow-[0_18px_42px_-32px_rgba(17,20,26,0.5)] transition duration-200 hover:-translate-y-1 hover:border-[#c39a5f] active:cursor-grabbing",
                          draggedTaskId === task.id && "opacity-60"
                        )}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <button
                              type="button"
                              className="text-left text-base font-semibold leading-6 text-ink underline-offset-2 hover:underline"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedTaskId(task.id);
                              }}
                            >
                              {task.title}
                            </button>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Drag to move
                            </p>
                          </div>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        <p className="text-sm leading-6 text-slate-700">{task.description}</p>

                        {task.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {task.tags.map((tag) => (
                              <Badge key={tag}>{tag}</Badge>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-[0.78rem] leading-6 text-slate-600">
                          <p>
                            <span className="font-semibold uppercase tracking-[0.16em] text-slate-500">Due</span>
                            <span className="ml-2 font-semibold text-ink">{formatDate(task.dueDate)}</span>
                          </p>
                          <p>
                            <span className="font-semibold uppercase tracking-[0.16em] text-slate-500">Points</span>
                            <span className="ml-2 font-semibold text-ink">{task.officialStoryPoints ?? "Pending"}</span>
                          </p>
                          <p>
                            <span className="font-semibold uppercase tracking-[0.16em] text-slate-500">Voting</span>
                            <span className="ml-2 font-semibold text-ink">
                              {votingInsight.votedMemberIds.length}/{members.length}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold uppercase tracking-[0.16em] text-slate-500">Fit</span>
                            <span className="ml-2 font-semibold text-ink">{getWorkloadFit(task, memberPoints, averagePoints)}</span>
                          </p>
                        </div>

                        <div
                          className="flex items-center justify-between gap-3 border-t border-[#ede1cf] pt-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {assignee ? <Avatar member={assignee} size="sm" /> : null}
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Assignee
                              </p>
                              <p className="truncate text-sm font-semibold text-ink">
                                {assignee?.name ?? "Unassigned"}
                              </p>
                            </div>
                          </div>

                          <div className="w-36">
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
