"use client";

import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSNAMES: Record<Variant, string> = {
  primary: "border border-ink bg-ink text-white hover:bg-storm",
  secondary: "border border-slate-300 bg-white text-ink hover:bg-slate-50",
  ghost: "border border-transparent bg-transparent text-ink hover:bg-slate-100",
  danger: "border border-red-600 bg-red-600 text-white hover:bg-red-700"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSNAMES[variant],
        className
      )}
      {...props}
    />
  );
}
