"use client";

export function SettingsClient({ canUseSupabase }: { canUseSupabase: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {!canUseSupabase ? (
        <p className="w-full rounded-xl bg-amber-100 p-3 text-sm text-amber-800">
          Supabase credentials are not configured. Add the required environment variables to enable sign-in,
          team data, tasks, voting, analytics, and encrypted comments.
        </p>
      ) : (
        <p className="w-full rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          Sign-out and account actions now live in the fixed account control at the bottom of the sidebar.
        </p>
      )}
    </div>
  );
}
