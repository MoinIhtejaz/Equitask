import { Card } from "@/components/ui/Card";
import { TIME_BLOCK_ORDER, WEEKDAY_ORDER } from "@/lib/constants";
import { Member } from "@/types";

export function AvailabilityGrid({ member }: { member: Member }) {
  const meetingFriendlyWindows = member.availability.map(
    (slot) => `${slot.day.charAt(0).toUpperCase() + slot.day.slice(1)} ${slot.block}`
  );

  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-ink">Weekly Availability</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className="p-2 text-left text-slate-500">Day</th>
              {TIME_BLOCK_ORDER.map((block) => (
                <th key={block} scope="col" className="p-2 text-left text-slate-500">
                  {block}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKDAY_ORDER.map((day) => (
              <tr key={day} className="border-t border-slate-200">
                <th scope="row" className="p-2 text-left font-normal capitalize text-slate-700">
                  {day}
                </th>
                {TIME_BLOCK_ORDER.map((block) => {
                  const available = member.availability.some(
                    (slot) => slot.day === day && slot.block === block
                  );

                  return (
                    <td key={block} className="p-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Meeting-Friendly Windows
        </p>
        {meetingFriendlyWindows.length === 0 ? (
          <p className="rounded-[22px] border border-dashed border-[#d7c7ab] p-4 text-sm text-slate-600">
            No availability set yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {meetingFriendlyWindows.map((window) => (
              <span
                key={window}
                className="inline-flex rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700"
              >
                {window}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
