"use client";

import { AnimatePresence, motion } from "framer-motion";
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
  { href: "/board", label: "Scrum Board", icon: BoardIcon },
  { href: "/voting", label: "Voting", icon: VotingIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon }
];

const COLLAPSE_STORAGE_KEY = "equitask-sidebar-collapsed";

function DashboardIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 13h7V4H4v9Z" />
      <path d="M13 20h7v-5h-7v5Z" />
      <path d="M13 11h7V4h-7v7Z" />
      <path d="M4 20h7v-5H4v5Z" />
    </svg>
  );
}

function BoardIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
      <path d="M7 4v16" />
      <path d="M17 4v16" />
    </svg>
  );
}

function VotingIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M9 12.75 11.25 15 15 9.75" />
      <path d="M21 12a9 9 0 1 1-4.38-7.72" />
    </svg>
  );
}

function AnalyticsIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 19V5" />
      <path d="M20 19H4" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-8" />
    </svg>
  );
}

function SettingsIcon(className = "h-5 w-5") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
      <path d="m19.4 15 .6 1-1.8 3.1-1.2-.1a8.9 8.9 0 0 1-1.3.8l-.3 1.2h-3.6l-.3-1.2a8.9 8.9 0 0 1-1.3-.8l-1.2.1L4 16l.6-1a9.5 9.5 0 0 1 0-2l-.6-1L5.8 8.9l1.2.1c.4-.3.8-.5 1.3-.8l.3-1.2h3.6l.3 1.2c.5.2.9.5 1.3.8l1.2-.1L20 12l-.6 1c.1.7.1 1.3 0 2Z" />
    </svg>
  );
}

function UserIcon(className = "h-4 w-4") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

function CollapseIcon(className = "h-4 w-4") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M15 18 9 12l6-6" />
      <path d="M20 5v14" />
    </svg>
  );
}

function ExpandIcon(className = "h-4 w-4") {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="m9 18 6-6-6-6" />
      <path d="M4 5v14" />
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

  async function switchToDemo() {
    try {
      setIsSigningOut(true);
      await fetch("/api/auth/demo", { method: "POST" });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsSigningOut(false);
      setMenuOpen(false);
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 108 : 304 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 lg:flex"
    >
      <div className="relative flex h-full w-full flex-col rounded-[32px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(195,154,95,0.2),transparent_28%),linear-gradient(180deg,#161b22_0%,#10151c_100%)] p-4 text-white shadow-[0_30px_80px_-36px_rgba(17,20,26,0.7)]">
        <div className="pointer-events-none absolute inset-x-5 top-0 h-20 rounded-b-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />

        <div className="relative flex items-start justify-between gap-3">
          <div className={cn("min-w-0", isCollapsed && "w-full")}>
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.42em] text-white/[0.42]",
                isCollapsed && "text-center"
              )}
            >
              {APP_NAME}
            </p>
            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 text-[2.25rem] font-semibold tracking-[-0.05em] text-[#fcf4e4]"
                >
                  Equitask
                </motion.h1>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 transition hover:border-[#d8b57d]/40 hover:bg-white/10 hover:text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? ExpandIcon() : CollapseIcon()}
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {LINKS.map((link) => {
            const active = matchesPath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={cn(
                  "group relative flex items-center rounded-[22px] px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                  isCollapsed ? "justify-center" : "gap-3",
                  active
                    ? "bg-[linear-gradient(135deg,rgba(255,244,221,0.14),rgba(195,154,95,0.18))] text-[#fff6e4] shadow-[inset_0_0_0_1px_rgba(217,191,146,0.16)]"
                    : "text-white/[0.74] hover:bg-white/[0.07] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl transition",
                    active
                      ? "bg-[#f0d9ae]/[0.12] text-[#f0d9ae]"
                      : "bg-white/5 text-white/[0.55] group-hover:bg-white/10 group-hover:text-white/[0.85]"
                  )}
                >
                  {link.icon("h-5 w-5")}
                </span>
                <AnimatePresence initial={false}>
                  {!isCollapsed ? (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="truncate"
                    >
                      {link.label}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto pt-6">
          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className={cn(
                  "absolute bottom-24 z-20 rounded-[28px] border border-white/10 bg-[#11161d]/[0.96] p-4 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur",
                  isCollapsed ? "left-[5rem] w-80" : "left-0 right-0"
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/[0.42]">Account</p>
                <p className="mt-3 text-base font-semibold text-[#fff6e4]">{session.name}</p>
                <p className="mt-1 text-sm text-white/[0.56]">
                  {session.mode === "demo" ? "Demo mode" : "Supabase mode"}
                </p>
                <p className="mt-3 rounded-2xl border border-white/[0.08] bg-white/5 px-3 py-2 text-sm text-white/[0.72]">
                  {session.teamName ? `Team: ${session.teamName}` : "No team finalized yet"}
                </p>

                {!session.teamId ? (
                  <Link
                    href="/dashboard"
                    className="mt-3 block rounded-2xl border border-[#d8b57d]/30 bg-[#d8b57d]/[0.12] px-4 py-3 text-sm font-semibold text-[#f5deb3] transition hover:bg-[#d8b57d]/[0.18]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Finalize team on dashboard
                  </Link>
                ) : null}

                <div className="mt-4 flex flex-col gap-2">
                  {session.mode !== "demo" ? (
                    <Button variant="secondary" onClick={switchToDemo} disabled={isSigningOut}>
                      Use Demo Workspace
                    </Button>
                  ) : null}
                  <Button variant="ghost" onClick={signOut} disabled={isSigningOut}>
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "group w-full rounded-[26px] border border-white/10 bg-white/[0.06] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-[#d8b57d]/[0.26] hover:bg-white/[0.08]",
              isCollapsed && "flex justify-center px-0"
            )}
          >
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-[#0a0d12] text-sm font-semibold text-[#fff5df] shadow-[0_0_0_4px_rgba(255,255,255,0.03)]">
                {initials}
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="min-w-0 flex-1"
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#fff6e4]">
                      {UserIcon("h-4 w-4 text-[#d8b57d]")}
                      <span className="truncate">Signed in as {session.name}</span>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/[0.52]">
                      {session.teamName ?? "Team setup pending"} • {session.mode === "demo" ? "Demo" : "Supabase"}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
