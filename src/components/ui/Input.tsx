import { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-[#d7c7ab] bg-white/[0.78] px-4 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-[#c39a5f] focus:bg-white focus:shadow-[0_0_0_4px_rgba(195,154,95,0.14)]",
        props.className
      )}
    />
  );
}
