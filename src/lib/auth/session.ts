import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/constants";
import { parseJsonSafely } from "@/lib/utils";
import { SessionUser } from "@/types";

const DEFAULT_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export function readSession(): SessionUser | null {
  const value = cookies().get(SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  const parsed = parseJsonSafely<SessionUser>(value);
  if (!parsed) {
    return null;
  }

  return parsed;
}

export function setSession(response: NextResponse, session: SessionUser): void {
  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), DEFAULT_COOKIE_OPTIONS);
}

export function clearSession(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    ...DEFAULT_COOKIE_OPTIONS,
    expires: new Date(0)
  });
}
