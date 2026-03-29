import { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLElement> {
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "lux-surface card-enter rounded-[28px] p-6 transition duration-300",
        className
      )}
      {...props}
    >
      {children}
    </article>
  );
}
