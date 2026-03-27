import { NextResponse } from "next/server";

import { Priority } from "@/types";
import { requireSession } from "@/services/authService";
import { createTask } from "@/services/workspaceService";

const ALLOWED_PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

export async function POST(request: Request) {
  try {
    const session = requireSession();
    const body = await request.json();

    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const dueDate = String(body.dueDate || "").trim();
    const priority = String(body.priority || "medium").trim() as Priority;
    const votingRequired = Boolean(body.votingRequired ?? true);
    const tags = Array.isArray(body.tags)
      ? body.tags
          .map((tag: unknown) => String(tag).trim())
          .filter((tag: string) => tag.length > 0)
      : String(body.tags || "")
          .split(",")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);

    if (!title || !description || !dueDate) {
      return NextResponse.json(
        { success: false, error: "Title, description, and due date are required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_PRIORITIES.includes(priority)) {
      return NextResponse.json({ success: false, error: "Invalid priority value." }, { status: 400 });
    }

    const task = await createTask(session, {
      title,
      description,
      dueDate,
      priority,
      tags,
      votingRequired
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not create task."
      },
      { status: 400 }
    );
  }
}
