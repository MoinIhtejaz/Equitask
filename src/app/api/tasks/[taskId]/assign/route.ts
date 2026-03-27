import { NextResponse } from "next/server";

import { requireSession } from "@/services/authService";
import { assignTask } from "@/services/workspaceService";

export async function PATCH(request: Request, context: { params: { taskId: string } }) {
  try {
    const body = await request.json();
    const assigneeId = body.assigneeId ? String(body.assigneeId) : null;

    const session = requireSession();
    const task = await assignTask(session, context.params.taskId, assigneeId);

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not assign task."
      },
      { status: 400 }
    );
  }
}
