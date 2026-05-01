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

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Due date</p>
            <p className="mt-3 text-xl font-semibold text-ink">{formatDate(task.dueDate)}</p>
          </div>
          <div className="rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Status</p>
            <p className="mt-3 text-xl font-semibold text-ink">{STATUS_LABELS[task.status]}</p>
          </div>
          <div className="rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Created by</p>
            <div className="mt-3 flex items-center gap-2">
              {creator ? <Avatar member={creator} size="sm" /> : null}
              <p className="text-xl font-semibold text-ink">{creatorName}</p>
            </div>
          </div>
          <div className="rounded-[24px] border border-[#e1d4be] bg-white/[0.72] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assigned to</p>
            <div className="mt-3 flex items-center gap-2">
              {assignee ? <Avatar member={assignee} size="sm" /> : null}
              <p className="text-xl font-semibold text-ink">{assigneeName}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-[#e1d4be] bg-white/[0.78] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Move task</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Push this task through the workflow without dragging the card.
              </p>
            </div>
            {isUpdatingStatus ? (
              <Badge className="border-[#c39a5f] bg-[#f8ecd6] text-[#7a5b2e]">Updating...</Badge>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {STATUS_ORDER.map((status) => {
              const isCurrent = task.status === status;

              return (
                <Button
                  key={status}
                  type="button"
                  variant={isCurrent ? "primary" : "ghost"}
                  disabled={isUpdatingStatus || isCurrent}
                  className={cn(
                    "justify-center",
                    isCurrent
                      ? "border-[#1b222c] bg-[#1b222c] text-white hover:bg-[#1b222c]"
                      : "border-[#d8c6a7] bg-white text-ink hover:border-[#c39a5f] hover:bg-[#fff8ed]"
                  )}
                  onClick={() => onStatusChange(status)}
                >
                  {STATUS_LABELS[status]}
                </Button>
              );
            })}
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

        <div className="mt-6 rounded-[28px] border border-[#e1d4be] bg-white/[0.78] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-kicker">Secure messages</p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">Comments</h3>
            </div>
            {mode === "supabase" ? (
              <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-800">
                Encrypted before storage
              </Badge>
            ) : null}
          </div>

          {mode === "supabase" ? (
            <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
              Comments are encrypted automatically before storage.
            </p>
          ) : null}

          {mode === "demo" ? (
            <div className="mt-4 max-w-xs">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Comment as
              </p>
              <select
                className="w-full rounded-2xl border border-[#d7c7ab] bg-white px-3 py-2 text-sm text-ink outline-none"
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
            <p className="mt-4 rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{commentError}</p>
          ) : null}

          <Textarea
            className="mt-4"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment about blockers, ownership, or decisions..."
            rows={3}
          />
          <Button className="mt-3" onClick={submitComment} disabled={isPostingComment || !comment.trim()}>
            {isPostingComment ? "Posting..." : "Post Comment"}
          </Button>

          <div className="mt-5 space-y-3">
            {comments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-[#d7c7ab] p-4 text-sm text-slate-600">
                No comments yet.
              </p>
            ) : null}

            {comments.map((item) => {
              const author = members.find((member) => member.id === item.memberId);
              const displayMessage =
                mode === "supabase"
                  ? decryptedComments[item.id] ?? (item.isEncrypted ? "Decrypting message..." : item.message)
                  : item.message;

              return (
                <div key={item.id} className="rounded-2xl border border-[#e1d4be] bg-white/70 p-4">
                  <p className="text-sm leading-6 text-slate-800">{displayMessage}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {author?.name ?? "Member"} • {formatDateTime(item.createdAt)}
                    {mode === "supabase" ? ` • ${item.isEncrypted ? "Encrypted" : "Legacy unencrypted"}` : ""}
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
