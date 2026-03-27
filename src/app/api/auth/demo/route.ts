import { NextResponse } from "next/server";

import { setSession } from "@/lib/auth/session";
import { createDemoSession } from "@/services/authService";

export async function POST() {
  const response = NextResponse.json({ success: true, mode: "demo" });
  setSession(response, createDemoSession());
  return response;
}
