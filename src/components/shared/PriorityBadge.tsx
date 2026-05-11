import { Badge } from "@/components/ui/Badge";
import { Priority } from "@/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-slate-200 bg-slate-50 text-slate-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  critical: "border-red-200 bg-red-50 text-red-700"
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_STYLES[priority]}>{priority.replace("_", " ")}</Badge>;
}
