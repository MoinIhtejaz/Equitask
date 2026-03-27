import { NextResponse } from "next/server";

import { requireSession } from "@/services/authService";
import { getWorkspaceSnapshot } from "@/services/workspaceService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = requireSession();
    const snapshot = await getWorkspaceSnapshot(session);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to load workspace."
      },
      { status: 401 }
    );
  }
}
