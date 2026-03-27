import { Card } from "@/components/ui/Card";

interface SummaryCardProps {
  label: string;
  value: string | number;
  caption?: string;
}

export function SummaryCard({ label, value, caption }: SummaryCardProps) {
  return (
    <Card className="space-y-1">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-ink">{value}</p>
      {caption ? <p className="text-xs text-slate-500">{caption}</p> : null}
    </Card>
  );
}
