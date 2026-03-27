"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/Card";

export function ProgressChart({
  data
}: {
  data: Array<{ label: string; completed: number; total: number }>;
}) {
  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-ink">Progress Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="label" stroke="#5c6b7b" />
            <YAxis stroke="#5c6b7b" allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="#2f6b4f" strokeWidth={3} />
            <Line type="monotone" dataKey="total" stroke="#1f3548" strokeWidth={2} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
