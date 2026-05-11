import { Card } from "@/components/ui/Card";

interface SummaryCardProps {
  label: string;
  value: string | number;
  caption?: string;
}

export function SummaryCard({ label, value, caption }: SummaryCardProps) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {caption ? <p className="mt-1 text-xs text-slate-500">{caption}</p> : null}
    </Card>
  );
}
