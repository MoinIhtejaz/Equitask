"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/Card";

export function ProgressChart({
  data
}: {
  data: Array<{ label: string; completed: number; total: number }>;
}) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-ink">Progress Over Time</h3>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis stroke="#64748b" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                fontSize: "12px"
              }}
            />
            <Line type="monotone" dataKey="completed" stroke="#11141a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="total" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
