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
      <h3 className="mb-4 text-lg font-semibold text-ink">Activity Feed</h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm text-slate-800">{event.message}</p>
            <p className="mt-1 text-xs text-slate-500">
              {event.memberId ? `${memberMap.get(event.memberId) ?? "Member"} • ` : ""}
              {formatDateTime(event.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
