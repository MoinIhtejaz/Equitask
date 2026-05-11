import { Card } from "@/components/ui/Card";
import { NotificationItem } from "@/types";
import { formatDateTime } from "@/lib/utils";

export function NotificationList({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink">Notifications</h3>
        <span className="text-xs text-slate-500">{notifications.length}</span>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        {notifications.slice(0, 6).map((notification) => (
          <div key={notification.id} className="py-2.5">
            <p className="text-sm text-slate-700">{notification.message}</p>
            <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(notification.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
