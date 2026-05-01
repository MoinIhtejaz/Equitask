"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { RecommendationPanel } from "@/components/shared/RecommendationPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { VotingBreakdown } from "@/components/voting/VotingBreakdown";
import { VotingPanel } from "@/components/voting/VotingPanel";
import {
  decryptCommentForTeam,
  encryptCommentForTeam
} from "@/lib/e2ee";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { AssignmentRecommendation } from "@/services/recommendationService";
import { Member, Task, TaskComment, TaskVote } from "@/types";

interface TaskDetailClientProps {
  task: Task;
  members: Member[];
  votes: TaskVote[];
  comments: TaskComment[];
  currentUserId: string;
  mode: "demo" | "supabase";
  recommendations: AssignmentRecommendation[];
}

export function TaskDetailClient({
  task,
  members,
  votes,
  comments,
  currentUserId,
  mode,
  recommendations
}: TaskDetailClientProps) {
  const router = useRouter();
  const [isBusy, setIsBusy] = useState(false);
  const [comment, setComment] = useState("");
  const [commentAs, setCommentAs] = useState(currentUserId);
  const [error, setError] = useState<string | null>(null);
  const [decryptedComments, setDecryptedComments] = useState<Record<string, string>>({});

  const assignee = members.find((member) => member.id === task.assigneeId);
  const assignmentLocked = task.votingRequired && !task.votingClosed;

  useEffect(() => {
    if (mode !== "supabase") {
      return;
    }

    let cancelled = false;

    async function decryptEncryptedComments() {
      const nextMessages: Record<string, string> = {};

      await Promise.all(
        comments.map(async (item) => {
          if (!item.isEncrypted) {
            nextMessages[item.id] = item.message;
            return;
          }

          if (!item.ciphertext || !item.iv) {
            nextMessages[item.id] = "Unable to decrypt this message on this device.";
            return;
          }

          try {
            nextMessages[item.id] = await decryptCommentForTeam(task.teamId, {
              ciphertext: item.ciphertext,
              iv: item.iv
            });
          } catch {
            nextMessages[item.id] = "Unable to decrypt this message on this device.";
          }
        })
      );

      if (!cancelled) {
        setDecryptedComments(nextMessages);
      }
    }

    void decryptEncryptedComments();

    return () => {
      cancelled = true;
    };
  }, [comments, mode, task.teamId]);

  async function saveStatus(status: string) {
    try {
      setIsBusy(true);
      setError(null);
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not update status.");
      }
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update status.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveAssignee(assigneeId: string) {
    if (assignmentLocked && assigneeId) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);
      const response = await fetch(`/api/tasks/${task.id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: assigneeId || null })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not update assignee.");
      }
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update assignee.");
    } finally {
      setIsBusy(false);
    }
  }

  async function submitComment() {
    if (!comment.trim()) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);
      const trimmedComment = comment.trim();
      const encryptedComment =
        mode === "supabase" ? await encryptCommentForTeam(task.teamId, trimmedComment) : undefined;
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: mode === "demo" ? trimmedComment : undefined,
          encryptedComment,
          memberId: mode === "demo" ? commentAs : undefined
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not post comment.");
      }
      setComment("");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not post comment.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
      <div className="space-y-4">
        {error ? <p className="rounded-xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold text-ink">{task.title}</h2>
            <PriorityBadge priority={task.priority} />
          </div>

          <p className="text-slate-600">{task.description}</p>

          <div className="flex flex-wrap gap-2">
            {task.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Current status</p>
              <p className="font-semibold text-slate-800">{STATUS_LABELS[task.status]}</p>
              <Select
                className="mt-2"
                disabled={isBusy}
                value={task.status}
                onChange={(event) => saveStatus(event.target.value)}
              >
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Assignee</p>
              <p className="font-semibold text-slate-800">{assignee?.name ?? "Unassigned"}</p>
              <Select
                className="mt-2"
                disabled={isBusy || assignmentLocked}
                value={task.assigneeId ?? ""}
                onChange={(event) => saveAssignee(event.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
              {assignmentLocked ? (
                <p className="mt-2 text-xs text-amber-700">
                  Assignment is locked until voting closes for this task.
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Due date</p>
              <p className="font-semibold text-slate-800">{formatDate(task.dueDate)}</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs text-slate-500">Official story points</p>
              <p className="font-semibold text-slate-800">{task.officialStoryPoints ?? "Pending votes"}</p>
            </div>
          </div>
        </Card>

        {task.votingClosed ? (
          <VotingBreakdown task={task} members={members} votes={votes} />
        ) : (
          <VotingPanel
            task={task}
            members={members}
            votes={votes}
            currentUserId={currentUserId}
            mode={mode}
          />
        )}

        <Card>
          <h3 className="mb-3 text-lg font-semibold text-ink">Comments</h3>

          {mode === "supabase" ? (
            <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
              Comments are encrypted automatically before storage.
            </p>
          ) : null}

          {mode === "demo" ? (
            <div className="mb-2 max-w-xs">
              <p className="mb-1 text-xs text-slate-500">Comment as</p>
              <Select value={commentAs} onChange={(event) => setCommentAs(event.target.value)}>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          <Textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment about blockers, ownership, or decisions..."
            rows={3}
          />
          <Button className="mt-2" onClick={submitComment} disabled={isBusy || !comment.trim()}>
            Post Comment
          </Button>

          <div className="mt-4 space-y-3">
            {comments.map((item) => {
              const author = members.find((member) => member.id === item.memberId);
              const displayMessage =
                mode === "supabase"
                  ? decryptedComments[item.id] ?? (item.isEncrypted ? "Decrypting message..." : item.message)
                  : item.message;
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="text-sm text-slate-800">{displayMessage}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {author?.name ?? "Member"} • {formatDateTime(item.createdAt)}
                    {mode === "supabase" ? ` • ${item.isEncrypted ? "Encrypted" : "Legacy unencrypted"}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <RecommendationPanel recommendations={recommendations} />

        <Card>
          <h3 className="mb-3 text-lg font-semibold text-ink">Activity Log</h3>
          <div className="space-y-2 text-sm">
            <p className="rounded-xl border border-slate-200 p-2">
              Task created on {formatDate(task.createdAt)}
            </p>
            <p className="rounded-xl border border-slate-200 p-2">
              Last updated on {formatDateTime(task.updatedAt)}
            </p>
            <p className="rounded-xl border border-slate-200 p-2">
              Voting status: {task.votingClosed ? "Closed" : "In progress"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
