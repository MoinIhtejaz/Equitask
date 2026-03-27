import { NextResponse } from "next/server";

import { VoteValue } from "@/types";
import { requireSession } from "@/services/authService";
import { submitVote } from "@/services/workspaceService";

const allowedVotes: VoteValue[] = [1, 2, 3, 5, 8, 13];

export async function POST(request: Request, context: { params: { taskId: string } }) {
  try {
    const body = await request.json();
    const value = Number(body.value) as VoteValue;

    if (!allowedVotes.includes(value)) {
      return NextResponse.json({ success: false, error: "Invalid vote value." }, { status: 400 });
    }

    const session = requireSession();

    const memberId =
      session.mode === "demo" ? String(body.memberId || session.id) : session.id;

    const votes = await submitVote(session, {
      taskId: context.params.taskId,
      memberId,
      value
    });

    return NextResponse.json({ success: true, votes });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not submit vote."
      },
      { status: 400 }
    );
  }
}
