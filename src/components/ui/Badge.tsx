import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps extends PropsWithChildren {
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#d8c6a7] bg-[#fbf6ed]/[0.85] px-3 py-1 text-xs font-semibold text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        className
      )}
    >
      {children}
    </span>
  );
}
