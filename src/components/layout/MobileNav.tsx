"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LINKS, matchesPath } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="lux-surface mb-4 overflow-x-auto rounded-[26px] px-3 py-3 lg:hidden"
    >
      <ul className="flex min-w-max items-center gap-2">
        {LINKS.map((link) => {
          const active = matchesPath(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c39a5f] focus-visible:ring-offset-2 focus-visible:ring-offset-veil",
                  active
                    ? "border-[#d9bf92] bg-[#f5e8ce] text-ink"
                    : "border-transparent text-slate-600 hover:bg-white/70 hover:text-ink"
                )}
              >
                <span aria-hidden="true">{link.icon("h-5 w-5")}</span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
