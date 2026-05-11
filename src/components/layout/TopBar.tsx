import { APP_NAME } from "@/lib/constants";
import { SessionUser } from "@/types";

export function TopBar({ session }: { session: SessionUser }) {
  const subtitle = session.teamName
    ? `${session.teamName}${session.projectName ? ` • ${session.projectName}` : ""}`
    : "Finish your team setup in the dashboard to unlock workspace data.";

  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
      <div>
        <h2 className="text-xl font-semibold text-ink">{APP_NAME}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {session.teamName ? "Team synced" : "Setup pending"}
      </span>
    </header>
  );
}
