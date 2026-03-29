"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function TaskComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState("");
  const [votingRequired, setVotingRequired] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createNewTask() {
    try {
      setIsBusy(true);
      setError(null);

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          priority,
          tags,
          votingRequired
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not create task.");
      }

      setTitle("");
      setDescription("");
      setDueDate("");
      setTags("");
      setPriority("medium");
      setVotingRequired(true);

      if (payload.task?.id && votingRequired) {
        router.push(`/tasks/${payload.task.id}`);
      } else {
        router.refresh();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create task.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-60 bg-[radial-gradient(circle_at_center,rgba(195,154,95,0.16),transparent_70%)]" />
      <div className="grid gap-6 xl:grid-cols-[1.45fr,0.85fr]">
        <div className="space-y-5">
          <div>
            <p className="section-kicker">Task intake</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Create and Launch a Task</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Define the work clearly, route it into voting if needed, and let the team estimate privately before
              assignment.
            </p>
          </div>

          {error ? <p className="rounded-2xl bg-rose-100 p-3 text-sm text-rose-700">{error}</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Task title
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Implement workload fairness recommendation engine"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Describe expected output, constraints, and what done looks like."
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Due date
              </label>
              <Input value={dueDate} onChange={(event) => setDueDate(event.target.value)} type="date" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Priority
              </label>
              <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Tags
              </label>
              <Input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="frontend, analytics, sprint-2"
              />
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">Separate tags with commas.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-[24px] border border-[#e2d6c3] bg-white/[0.72] p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={votingRequired}
              onChange={(event) => setVotingRequired(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-storm focus:ring-storm"
            />
            Require team voting before assignment
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              If voting is required, assignment is locked until all team members submit points.
            </p>
            <Button
              disabled={isBusy || !title.trim() || !description.trim() || !dueDate}
              onClick={createNewTask}
            >
              {isBusy ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(195,154,95,0.16),transparent_34%),linear-gradient(180deg,#171d25_0%,#10151c_100%)] p-6 text-white shadow-[0_24px_70px_-40px_rgba(17,20,26,0.9)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7bc8d]">Launch Flow</p>
          <h3 className="mt-3 text-2xl font-semibold text-[#fff7e9]">From task idea to backlog</h3>
          <p className="mt-3 text-sm leading-7 text-white/[0.68]">
            Equitask keeps intake structured so a new task lands with context, private estimation, and a clean handoff
            into execution.
          </p>

          <div className="mt-6 space-y-3">
            {[
              "Capture the work with a clear title, due date, and tags.",
              "Let every member vote privately on effort.",
              "Once voting closes, the task moves into backlog ready for assignment."
            ].map((line, index) => (
              <div
                key={line}
                className="flex gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.05] p-4"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9bf92]/[0.14] text-sm font-semibold text-[#f4e2bf]">
                  0{index + 1}
                </span>
                <p className="text-sm leading-6 text-white/[0.74]">{line}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[22px] border border-[#d9bf92]/[0.18] bg-[#d9bf92]/[0.08] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d7bc8d]">Voting state</p>
            <p className="mt-3 text-lg font-semibold text-[#fff7e9]">
              {votingRequired ? "Private estimate required" : "Direct assignment allowed"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/[0.66]">
              {votingRequired
                ? "The task enters the voting queue first and only shows on the board once the full team has voted."
                : "The task is immediately ready for assignment and board movement."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
