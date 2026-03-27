import { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <article className={cn("rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card", className)}>
      {children}
    </article>
  );
}
