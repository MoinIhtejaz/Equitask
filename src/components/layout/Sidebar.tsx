"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/types";

type LinkItem = {
  href: string;
  label: string;
  icon: (className?: string) => ReactNode;
};

const LINKS: LinkItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/teams", label: "Team", icon: TeamIcon },
  { href: "/board", label: "Scrum Board", icon: BoardIcon },
  { href: "/voting", label: "Voting", icon: VotingIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon }
];

const COLLAPSE_STORAGE_KEY = "equitask-sidebar-collapsed";

function DashboardIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function BoardIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <rect width="3" height="9" x="7" y="7" />
      <rect width="3" height="5" x="14" y="7" />
    </svg>
  );
}

function TeamIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function VotingIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AnalyticsIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

function SettingsIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CollapseIcon(className = "h-4 w-4") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <path d="M9 3v18" />
      <path d="m16 15-3-3 3-3" />
    </svg>
  );
}

function ExpandIcon(className = "h-4 w-4") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <path d="M9 3v18" />
      <path d="m14 9 3 3-3 3" />
    </svg>
  );
}

function matchesPath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ session }: { session: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const initials = session.name.slice(0, 2).toUpperCase();

  useEffect(() => {
    const storedValue = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    if (storedValue) {
      setIsCollapsed(storedValue === "true");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, isCollapsed]);

  async function signOut() {
    try {
      setIsSigningOut(true);
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
      router.refresh();
    } finally {
      setIsSigningOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <aside
      style={{ width: isCollapsed ? 72 : 240 }}
      className="sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 lg:flex"
    >
      <div className="relative flex h-full w-full flex-col rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-sm font-semibold tracking-tight text-ink">{APP_NAME}</span>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-ink"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? ExpandIcon() : CollapseIcon()}
          </button>
        </div>

        <nav className="mt-4 space-y-1">
          {LINKS.map((link) => {
            const active = matchesPath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={cn(
                  "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center" : "gap-3",
                  active
                    ? "bg-slate-100 text-ink"
                    : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {link.icon("h-5 w-5")}
                </span>
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto pt-4">
          {menuOpen ? (
            <div
              className={cn(
                "absolute bottom-16 z-20 rounded-lg border border-slate-200 bg-white p-3 shadow-lg",
                isCollapsed ? "left-[4.5rem] w-64" : "left-0 right-0"
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
              <p className="mt-2 text-sm font-semibold text-ink">{session.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {session.teamName ? `Team: ${session.teamName}` : "No team finalized yet"}
              </p>

              {!session.teamId ? (
                <Link
                  href="/dashboard"
                  className="mt-3 block rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Finalize team on dashboard
                </Link>
              ) : null}

              <div className="mt-3">
                <Button variant="ghost" onClick={signOut} disabled={isSigningOut}>
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-left hover:bg-slate-50",
              isCollapsed ? "justify-center" : "gap-3"
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-ink">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{session.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {session.teamName ?? "Team setup pending"}
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
