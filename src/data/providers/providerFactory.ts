import { demoProvider } from "@/data/providers/demoProvider";
import { DataProvider } from "@/data/providers/providerTypes";
import { supabaseProvider } from "@/data/providers/supabaseProvider";
import { isSupabaseConfigured } from "@/lib/mode";
import { SessionUser } from "@/types";

export function getDataProvider(session: SessionUser): DataProvider {
  if (session.mode === "supabase" && isSupabaseConfigured() && session.accessToken) {
    return supabaseProvider;
  }

  return demoProvider;
}
