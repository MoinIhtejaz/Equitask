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
    <Card className="relative overflow-hidden">
      <p className="section-kicker">Recent movement</p>
      <h3 className="mt-3 text-2xl font-semibold text-ink">Activity Feed</h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-[22px] border border-[#e8dece] bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
          >
            <div className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#171d25]" />
              <div>
                <p className="text-sm leading-6 text-slate-800">{event.message}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {event.memberId ? `${memberMap.get(event.memberId) ?? "Member"} • ` : ""}
                  {formatDateTime(event.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
