import { Card } from "@/components/ui/Card";
import { ActivityEvent, Member } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function ActivityFeed({
  events,
  members
}: {
  events: ActivityEvent[];
  members: Member[];
}) {
  const memberMap = new Map(members.map((member) => [member.id, member.name]));

  return (
    <Card>
      <h3 className="text-base font-semibold text-ink">Activity</h3>
      <div className="mt-3 divide-y divide-slate-100">
        {events.map((event) => (
          <div key={event.id} className="py-2.5">
            <p className="text-sm text-slate-700">{event.message}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {event.memberId ? `${memberMap.get(event.memberId) ?? "Member"} • ` : ""}
              {formatDateTime(event.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
