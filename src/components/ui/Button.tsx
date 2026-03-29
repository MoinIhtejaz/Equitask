"use client";

import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSNAMES: Record<Variant, string> = {
  primary:
    "border border-storm bg-storm text-[#fff6e4] shadow-[0_16px_36px_-22px_rgba(17,20,26,0.75)] hover:-translate-y-0.5 hover:bg-ink",
  secondary:
    "border border-[#d5b786] bg-[linear-gradient(135deg,#f6e9cb_0%,#e8c98e_100%)] text-ink shadow-[0_16px_36px_-24px_rgba(195,154,95,0.85)] hover:-translate-y-0.5 hover:brightness-[1.03]",
  ghost:
    "border border-[rgba(17,20,26,0.08)] bg-white/[0.65] text-storm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 hover:bg-white",
  danger:
    "border border-[#b45f3a]/[0.35] bg-[#b45f3a] text-white shadow-[0_16px_36px_-24px_rgba(180,95,58,0.75)] hover:-translate-y-0.5 hover:bg-[#9f522f]"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSNAMES[variant],
        className
      )}
      {...props}
    />
  );
}
