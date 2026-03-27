import { NextResponse } from "next/server";

import { addComment } from "@/services/workspaceService";
import { requireSession } from "@/services/authService";

export async function POST(request: Request, context: { params: { taskId: string } }) {
  try {
    const body = await request.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json({ success: false, error: "Comment cannot be empty." }, { status: 400 });
    }

    const session = requireSession();
    const memberId =
      session.mode === "demo" ? String(body.memberId || session.id) : session.id;

    const comment = await addComment(session, {
      taskId: context.params.taskId,
      memberId,
      message
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not add comment."
      },
      { status: 400 }
    );
  }
}
