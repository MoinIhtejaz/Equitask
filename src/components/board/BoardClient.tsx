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
import { Task, TaskComment, TaskStatus, TaskVote, Member } from "@/types";
import { getVotingInsight } from "@/services/voteService";

interface BoardClientProps {
  tasks: Task[];
  members: Member[];
  votes: TaskVote[];
  comments: TaskComment[];
  currentUserId: string;
  mode: "demo" | "supabase";
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

export function BoardClient({ tasks, members, votes, comments, currentUserId, mode }: BoardClientProps) {
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
      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

      <div className="overflow-x-auto pb-3">
        <div className="grid min-w-[1200px] gap-3 xl:grid-cols-5">
          {STATUS_ORDER.map((status) => {
            const columnTasks = boardTasks.filter((task) => getBoardStatus(task) === status);
            const isDropActive = dropTargetStatus === status;

            return (
              <section
                key={status}
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (draggedTaskId) {
                    setDropTargetStatus(status);
                  }
                }}
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
                  "rounded-lg border p-3 transition-colors",
                  isDropActive
                    ? "border-ink bg-slate-50"
                    : "border-slate-200 bg-slate-50/60"
                )}
              >
                <header className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{STATUS_LABELS[status]}</h3>
                  <Badge>{columnTasks.length}</Badge>
                </header>

                <div
                  className="min-h-[10rem] space-y-3"
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
                >
                  {columnTasks.length === 0 ? (
                    <div className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-500">
                      {draggedTaskId ? `Drop into ${STATUS_LABELS[status]}` : "Empty"}
                    </div>
                  ) : null}

                  {columnTasks.map((task) => {
                    const assignee = task.assigneeId ? memberMap.get(task.assigneeId) : null;
                    const assigneeName = assignee?.name ?? task.assigneeName ?? "Unassigned";
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
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (draggedTaskId && draggedTaskId !== task.id) {
                            event.dataTransfer.dropEffect = "move";
                            setDropTargetStatus(status);
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (draggedTaskId && draggedTaskId !== task.id) {
                            void dropTaskIntoColumn(status);
                          }
                        }}
                        className={cn(
                          "cursor-grab space-y-3 rounded-md border border-slate-200 bg-white p-3 hover:border-slate-300 active:cursor-grabbing",
                          draggedTaskId === task.id && "opacity-60"
                        )}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            className="text-left text-sm font-semibold text-ink hover:underline"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedTaskId(task.id);
                            }}
                          >
                            {task.title}
                          </button>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        <p className="line-clamp-2 text-xs text-slate-600">{task.description}</p>

                        {task.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <Badge key={tag}>{tag}</Badge>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                          <span>Due <span className="font-medium text-ink">{formatDate(task.dueDate)}</span></span>
                          <span>Pts <span className="font-medium text-ink">{task.officialStoryPoints ?? "—"}</span></span>
                          <span>Votes <span className="font-medium text-ink">{votingInsight.votedMemberIds.length}/{members.length}</span></span>
                          <span className="text-slate-500">{getWorkloadFit(task, memberPoints, averagePoints)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
                            {assignee ? <Avatar member={assignee} size="sm" /> : null}
                            <span className="truncate">{assigneeName}</span>
                          </div>
                          <div
                            className="w-32"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Select
                              value={task.assigneeId ?? ""}
                              disabled={busyTaskId === task.id}
                              onChange={(event) => updateAssignee(task.id, event.target.value)}
                              className="py-1 text-xs"
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
          comments={comments
            .filter((comment) => comment.taskId === selectedTask.id)
            .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())}
          currentUserId={currentUserId}
          mode={mode}
          isUpdatingStatus={busyTaskId === selectedTask.id}
          onStatusChange={(status) => void updateStatus(selectedTask.id, status, true)}
          onClose={() => setSelectedTaskId(null)}
        />
      ) : null}
    </div>
  );
}
