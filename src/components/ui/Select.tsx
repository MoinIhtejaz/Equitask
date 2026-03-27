import { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-storm/20 transition focus:border-storm focus:ring",
        props.className
      )}
    />
  );
}
