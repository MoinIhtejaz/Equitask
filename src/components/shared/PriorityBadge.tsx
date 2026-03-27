import { Badge } from "@/components/ui/Badge";
import { Priority } from "@/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "border-emerald-300 bg-emerald-50 text-emerald-700",
  medium: "border-sky-300 bg-sky-50 text-sky-700",
  high: "border-amber-300 bg-amber-50 text-amber-700",
  critical: "border-rose-300 bg-rose-50 text-rose-700"
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_STYLES[priority]}>{priority.replace("_", " ")}</Badge>;
}
