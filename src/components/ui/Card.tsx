import { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLElement> {
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <article
      className={cn("rounded-xl border border-slate-200 bg-white p-5", className)}
      {...props}
    >
      {children}
    </article>
  );
}
