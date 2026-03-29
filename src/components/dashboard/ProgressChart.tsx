"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/Card";

export function ProgressChart({
  data
}: {
  data: Array<{ label: string; completed: number; total: number }>;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(195,154,95,0.2),transparent_72%)]" />
      <p className="section-kicker">Delivery Curve</p>
      <h3 className="mt-3 text-2xl font-semibold text-ink">Progress Over Time</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Compare completed work against the full project scope to see whether delivery is keeping pace.
      </p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="completedLine" x1="0" x2="1">
                <stop offset="0%" stopColor="#171d25" />
                <stop offset="100%" stopColor="#c39a5f" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(17,20,26,0.08)" strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="label" stroke="#7f6a49" tickLine={false} axisLine={false} />
            <YAxis stroke="#7f6a49" allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: "rgba(17,20,26,0.12)", strokeDasharray: "4 6" }}
              contentStyle={{
                borderRadius: "18px",
                border: "1px solid rgba(195,154,95,0.2)",
                background: "rgba(255,249,240,0.95)",
                boxShadow: "0 18px 45px -28px rgba(17,20,26,0.35)"
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="url(#completedLine)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, stroke: "#171d25", fill: "#fff8ea" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#8f6d3b"
              strokeWidth={2}
              strokeDasharray="5 6"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
