import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-[#eadfcd]", className)}>
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,#b4874b_0%,#d2b47d_45%,#2f6b4f_100%)] shadow-[0_0_18px_rgba(195,154,95,0.38)] transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
