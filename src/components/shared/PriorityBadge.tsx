import { Badge } from "@/components/ui/Badge";
import { Priority } from "@/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "border-emerald-300/70 bg-emerald-50/75 text-emerald-700",
  medium: "border-[#cdb88e] bg-[#f5e9d0] text-[#76562a]",
  high: "border-amber-300/70 bg-amber-50/75 text-amber-700",
  critical: "border-[#c98773] bg-[#f7dfd8] text-[#8a4c38]"
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_STYLES[priority]}>{priority.replace("_", " ")}</Badge>;
}
