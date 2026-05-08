import { readSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/mode";
import { getPasswordValidationError } from "@/lib/security/password";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SessionUser } from "@/types";

export interface SupabaseAuthResult {
  session: SessionUser | null;
  message: string;
}

export function getCurrentSession(): SessionUser | null {
  return readSession();
}

export function requireSession(): SessionUser {
  const session = readSession();
  if (!session) {
    throw new Error("Not authenticated.");
  }
  if (session.mode !== "supabase") {
    throw new Error("Supabase sign-in required.");
  }
  return session;
}

export async function signInWithSupabase(email: string, password: string): Promise<SessionUser> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  if (!email || getPasswordValidationError(password)) {
    throw new Error("Invalid email or password.");
  }

  const client = createSupabaseServerClient();

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    throw new Error("Invalid email or password.");
  }

  return {
    id: data.user.id,
    mode: "supabase",
    name: (data.user.user_metadata?.name as string | undefined) || email.split("@")[0],
    email: data.user.email,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token
  };
}

export async function signUpWithSupabase(
  name: string,
  email: string,
  password: string
): Promise<SupabaseAuthResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const passwordError = getPasswordValidationError(password);
  if (!name.trim() || !email.trim() || passwordError) {
    throw new Error(passwordError || "Name and email are required.");
  }

  const client = createSupabaseServerClient();

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session || !data.user) {
    return {
      session: null,
      message:
        "Sign-up succeeded. If email confirmation is enabled in Supabase, verify your email before signing in."
    };
  }

  return {
    session: {
      id: data.user.id,
      mode: "supabase",
      name: (data.user.user_metadata?.name as string | undefined) || name,
      email: data.user.email,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    },
    message: "Account created and signed in successfully."
  };
}
