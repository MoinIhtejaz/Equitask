import { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-ink focus:ring-1 focus:ring-ink",
        props.className
      )}
    />
  );
}
