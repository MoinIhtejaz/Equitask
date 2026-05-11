"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/shared/Avatar";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { VotingBreakdown } from "@/components/voting/VotingBreakdown";
import {
  decryptCommentForTeam,
  encryptCommentForTeam
} from "@/lib/e2ee";
import { STATUS_LABELS, STATUS_ORDER } from "@/lib/constants";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Member, Task, TaskComment, TaskStatus, TaskVote } from "@/types";

export function BoardTaskModal({
  task,
  members,
  votes,
  comments,
  currentUserId,
  mode,
  isUpdatingStatus,
  onStatusChange,
  onClose
}: {
  task: Task;
  members: Member[];
  votes: TaskVote[];
  comments: TaskComment[];
  currentUserId: string;
  mode: "demo" | "supabase";
  isUpdatingStatus: boolean;
  onStatusChange: (status: TaskStatus) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [commentAs, setCommentAs] = useState(currentUserId);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [decryptedComments, setDecryptedComments] = useState<Record<string, string>>({});
  const assignee = members.find((member) => member.id === task.assigneeId) ?? null;
  const creator = members.find((member) => member.id === task.createdById) ?? null;
  const creatorName = creator?.name ?? task.createdByName ?? "Unknown member";
  const assigneeName = assignee?.name ?? task.assigneeName ?? "Unassigned";

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

  async function submitComment() {
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      return;
    }

    try {
      setIsPostingComment(true);
      setCommentError(null);

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
      setCommentError(caughtError instanceof Error ? caughtError.message : "Could not post comment.");
    } finally {
      setIsPostingComment(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">{task.title}</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-600">{task.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Due</dt>
            <dd className="font-medium text-ink">{formatDate(task.dueDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Status</dt>
            <dd className="font-medium text-ink">{STATUS_LABELS[task.status]}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Created by</dt>
            <dd className="flex items-center gap-1.5">
              {creator ? <Avatar member={creator} size="sm" /> : null}
              <span className="font-medium text-ink">{creatorName}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Assigned to</dt>
            <dd className="flex items-center gap-1.5">
              {assignee ? <Avatar member={assignee} size="sm" /> : null}
              <span className="font-medium text-ink">{assigneeName}</span>
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <p className="text-xs text-slate-500">Move task</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STATUS_ORDER.map((status) => {
              const isCurrent = task.status === status;
              return (
                <Button
                  key={status}
                  type="button"
                  variant={isCurrent ? "primary" : "secondary"}
                  disabled={isUpdatingStatus || isCurrent}
                  className={cn("text-xs", isCurrent && "cursor-default")}
                  onClick={() => onStatusChange(status)}
                >
                  {STATUS_LABELS[status]}
                </Button>
              );
            })}
            {isUpdatingStatus ? <span className="text-xs text-slate-500">Updating…</span> : null}
          </div>
        </div>

        {task.votingRequired && task.votingClosed ? (
          <div className="mt-5">
            <VotingBreakdown task={task} members={members} votes={votes} />
          </div>
        ) : null}

        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Comments</h3>
            {mode === "supabase" ? (
              <span className="text-xs text-emerald-700">Encrypted</span>
            ) : null}
          </div>

          {mode === "demo" ? (
            <div className="mt-3 max-w-xs">
              <label className="mb-1 block text-xs text-slate-500">Comment as</label>
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none"
                value={commentAs}
                onChange={(event) => setCommentAs(event.target.value)}
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {commentError ? (
            <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{commentError}</p>
          ) : null}

          <Textarea
            className="mt-3"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment…"
            rows={3}
          />
          <Button className="mt-2" onClick={submitComment} disabled={isPostingComment || !comment.trim()}>
            {isPostingComment ? "Posting…" : "Post Comment"}
          </Button>

          <div className="mt-4 divide-y divide-slate-100">
            {comments.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">No comments yet.</p>
            ) : null}

            {comments.map((item) => {
              const author = members.find((member) => member.id === item.memberId);
              const displayMessage =
                mode === "supabase"
                  ? decryptedComments[item.id] ?? (item.isEncrypted ? "Decrypting…" : item.message)
                  : item.message;

              return (
                <div key={item.id} className="py-2.5">
                  <p className="text-sm text-slate-700">{displayMessage}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {author?.name ?? "Member"} • {formatDateTime(item.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
