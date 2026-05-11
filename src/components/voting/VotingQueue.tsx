"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { VotingPanel } from "./VotingPanel";
import { Member, Task, TaskVote } from "@/types";

interface VotingQueueProps {
  tasks: Task[];
  members: Member[];
  votes: TaskVote[];
  currentUserId: string;
  mode: "demo" | "supabase";
}

export function VotingQueue({ tasks, members, votes, currentUserId, mode }: VotingQueueProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (tasks.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-600">No active votes. Tasks appear here until everyone has voted.</p>
      </Card>
    );
  }

  if (currentIndex >= tasks.length) {
    return (
      <Card className="space-y-2 text-center py-8">
        <p className="text-lg font-semibold text-ink">All caught up!</p>
        <p className="text-sm text-slate-500">You&apos;ve voted on all {tasks.length} task{tasks.length !== 1 ? "s" : ""} in the queue.</p>
      </Card>
    );
  }

  const task = tasks[currentIndex];

  function handleVoted() {
    setCurrentIndex((prev) => prev + 1);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Task {currentIndex + 1} of {tasks.length}</span>
        <div className="flex gap-1.5">
          {tasks.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-1.5 w-6 rounded-full transition-colors ${i < currentIndex ? "bg-green-400" : i === currentIndex ? "bg-indigo-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">{task.title}</h2>
          {task.description ? (
            <p className="mt-1 text-sm text-slate-600">{task.description}</p>
          ) : null}
        </div>

        <VotingPanel
          task={task}
          members={members}
          votes={votes.filter((v) => v.taskId === task.id)}
          currentUserId={currentUserId}
          mode={mode}
          onVoted={handleVoted}
        />
      </Card>
    </div>
  );
}
