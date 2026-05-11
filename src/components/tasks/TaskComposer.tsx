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
    <Card className="space-y-4">
      <h2 className="text-base font-semibold text-ink">Create Task</h2>

      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-slate-500">Title</label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-slate-500">Description</label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="What does done look like?"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Due date</label>
          <Input value={dueDate} onChange={(event) => setDueDate(event.target.value)} type="date" />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Priority</label>
          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-slate-500">Tags (comma separated)</label>
          <Input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="frontend, analytics"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={votingRequired}
          onChange={(event) => setVotingRequired(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Require team voting before assignment
      </label>

      <Button
        disabled={isBusy || !title.trim() || !description.trim() || !dueDate}
        onClick={createNewTask}
      >
        {isBusy ? "Creating…" : "Create Task"}
      </Button>
    </Card>
  );
}
