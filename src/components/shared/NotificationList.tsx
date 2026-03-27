import { Card } from "@/components/ui/Card";
import { NotificationItem } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">Notifications</h3>
        <span className="text-xs text-slate-500">{notifications.length} recent</span>
      </div>

      <div className="space-y-3">
        {notifications.slice(0, 6).map((notification) => (
          <div key={notification.id} className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm text-slate-800">{notification.message}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
