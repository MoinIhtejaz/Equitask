"use client";

import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSNAMES: Record<Variant, string> = {
  primary: "bg-storm text-white hover:bg-ink",
  secondary: "bg-moss text-white hover:bg-[#24563f]",
  ghost: "bg-transparent text-storm hover:bg-storm/10",
  danger: "bg-ember text-white hover:bg-[#9f3f26]"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSNAMES[variant],
        className
      )}
      {...props}
    />
  );
}
