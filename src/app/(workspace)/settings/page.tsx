import { Card } from "@/components/ui/Card";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { requireWorkspaceSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/mode";

export default function SettingsPage() {
  const session = requireWorkspaceSession();

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-slate-600">
          Manage mode switching, auth state, and Supabase integration readiness.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink">Current Session</h2>
        <p className="mt-2 text-sm text-slate-600">Mode: {session.mode}</p>
        <p className="text-sm text-slate-600">User: {session.name}</p>
        <p className="text-sm text-slate-600">Active team: {session.teamName ?? "Not selected"}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-ink">Environment</h2>
        <p className="mt-2 text-sm text-slate-600">
          Supabase configured: {isSupabaseConfigured() ? "Yes" : "No"}
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
      </Card>

      <SettingsClient canUseSupabase={isSupabaseConfigured()} />
    </div>
  );
}
