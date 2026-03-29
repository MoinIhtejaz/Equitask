import { Card } from "@/components/ui/Card";
import { NotificationItem } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="section-kicker">Signals</p>
          <h3 className="mt-3 text-2xl font-semibold text-ink">Notifications</h3>
        </div>
        <span className="rounded-full border border-[#e2d7c3] bg-white/[0.65] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {notifications.length} recent
        </span>
      </div>

      <div className="space-y-3">
        {notifications.slice(0, 6).map((notification) => (
          <div
            key={notification.id}
            className="rounded-[22px] border border-[#e8dece] bg-white/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
          >
            <div className="flex gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#c39a5f]" />
              <div>
                <p className="text-sm leading-6 text-slate-800">{notification.message}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
