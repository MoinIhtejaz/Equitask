import { APP_NAME } from "@/lib/constants";
import { SessionUser } from "@/types";

export function TopBar({ session }: { session: SessionUser }) {
  return (
    <header className="lux-surface relative mb-6 overflow-hidden rounded-[32px] px-6 py-6 sm:px-8 sm:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(195,154,95,0.18),transparent_28%),linear-gradient(120deg,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-kicker">Workspace</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-[2.35rem]">
            {session.teamName ? `${APP_NAME} Command Deck` : `${APP_NAME} Workspace`}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {session.teamName
              ? `${session.teamName}${session.projectName ? ` • ${session.projectName}` : ""}`
              : "Finish your team setup in the dashboard to unlock team workspace data."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full border border-[#d9bf92] bg-[#f3e2bf]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#76562a] shadow-sm">
            {session.teamName ? "Team synced" : "Team setup pending"}
          </span>
        </div>
      </div>
    </header>
  );
}
