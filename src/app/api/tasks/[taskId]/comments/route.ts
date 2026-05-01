import { NextResponse } from "next/server";

import { addComment } from "@/services/workspaceService";
import { requireSession } from "@/services/authService";

function parseEncryptedComment(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const ciphertext = typeof candidate.ciphertext === "string" ? candidate.ciphertext : "";
  const iv = typeof candidate.iv === "string" ? candidate.iv : "";
  const encryptionVersion =
    typeof candidate.encryptionVersion === "string" ? candidate.encryptionVersion : "";
  const encryptionAlgorithm =
    typeof candidate.encryptionAlgorithm === "string" ? candidate.encryptionAlgorithm : "";
  const keyId = typeof candidate.keyId === "string" ? candidate.keyId : null;

  if (!ciphertext || !iv || encryptionVersion !== "e2ee-v1" || encryptionAlgorithm !== "AES-GCM-256") {
    return null;
  }

  return {
    ciphertext,
    iv,
    encryptionVersion,
    encryptionAlgorithm,
    keyId
  };
}

export async function POST(request: Request, context: { params: { taskId: string } }) {
  try {
    const body = await request.json();
    const session = requireSession();
    const memberId =
      session.mode === "demo" ? String(body.memberId || session.id) : session.id;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const encryptedComment = parseEncryptedComment(body.encryptedComment);

    if (session.mode === "supabase" && !encryptedComment) {
      return NextResponse.json(
        { success: false, error: "Encrypted comment payload is required." },
        { status: 400 }
      );
    }

    if (session.mode === "demo" && !message) {
      return NextResponse.json({ success: false, error: "Comment cannot be empty." }, { status: 400 });
    }

    const comment = await addComment(session, {
      taskId: context.params.taskId,
      memberId,
      message,
      encryptedComment: encryptedComment ?? undefined
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
