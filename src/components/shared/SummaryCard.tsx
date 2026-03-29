import { Card } from "@/components/ui/Card";

interface SummaryCardProps {
  label: string;
  value: string | number;
  caption?: string;
}

export function SummaryCard({ label, value, caption }: SummaryCardProps) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(195,154,95,0),rgba(195,154,95,0.9),rgba(195,154,95,0))]" />
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-4xl font-semibold tracking-[-0.05em] text-ink">{value}</p>
        <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle,rgba(195,154,95,0.18),transparent_68%)]" />
      </div>
      {caption ? <p className="mt-3 text-sm leading-6 text-slate-500">{caption}</p> : null}
    </Card>
  );
}
