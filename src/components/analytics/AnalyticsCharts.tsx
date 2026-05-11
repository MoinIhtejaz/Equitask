"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card } from "@/components/ui/Card";
import { AnalyticsSnapshot } from "@/services/analyticsService";

const PIE_COLORS = ["#11141a", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

const TOOLTIP_STYLE = {
  borderRadius: "6px",
  border: "1px solid #e5e7eb",
  background: "#ffffff",
  fontSize: "12px"
};

const AXIS_STYLE = { stroke: "#64748b", fontSize: 12 };

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-3 h-56">{children}</div>
    </Card>
  );
}

export function AnalyticsCharts({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ChartCard title="Completed Tasks by Member">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.completedByMember} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" fill="#11141a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Story Points Delivered">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.storyPointsByMember} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <YAxis tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" fill="#64748b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Project Progress">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics.progressOverTime} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <YAxis tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="completed" stroke="#11141a" fill="#11141a" fillOpacity={0.15} />
            <Area type="monotone" dataKey="total" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Task Status Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={analytics.statusDistribution}
              dataKey="value"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={{ fontSize: 11 }}
            >
              {analytics.statusDistribution.map((entry, index) => (
                <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Workload Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.workloadDistribution} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <YAxis tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" fill="#11141a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Voting Agreement">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.votingAgreement} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="task" hide />
            <YAxis tickLine={false} axisLine={false} {...AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="disagreement" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="average" fill="#11141a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
