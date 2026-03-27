import { NextResponse } from "next/server";

import { TaskStatus } from "@/types";
import { requireSession } from "@/services/authService";
import { updateTaskStatus } from "@/services/workspaceService";

const allowed: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

export async function PATCH(request: Request, context: { params: { taskId: string } }) {
  try {
    const body = await request.json();
    const status = body.status as TaskStatus;

    if (!allowed.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid task status." }, { status: 400 });
    }

    const session = requireSession();
    const task = await updateTaskStatus(session, context.params.taskId, status);

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not update task status."
      },
      { status: 400 }
    );
  }
}
