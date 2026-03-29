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

const PIE_COLORS = ["#171d25", "#c39a5f", "#2f6b4f", "#b45f3a", "#8d7350"];

function ChartCard({
  kicker,
  title,
  children
}: {
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(195,154,95,0.18),transparent_72%)]" />
      <p className="section-kicker">{kicker}</p>
      <h3 className="mt-3 text-2xl font-semibold text-ink">{title}</h3>
      <div className="mt-4 h-64">{children}</div>
    </Card>
  );
}

export function AnalyticsCharts({ analytics }: { analytics: AnalyticsSnapshot }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard kicker="Contribution" title="Completed Tasks by Member">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.completedByMember} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(17,20,26,0.08)" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#7f6a49" />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke="#7f6a49" />
              <Tooltip
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid rgba(195,154,95,0.2)",
                  background: "rgba(255,249,240,0.95)"
                }}
              />
              <Bar dataKey="value" fill="#1f3548" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </ChartCard>

      <ChartCard kicker="Effort" title="Story Points Delivered">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.storyPointsByMember} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(17,20,26,0.08)" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#7f6a49" />
              <YAxis tickLine={false} axisLine={false} stroke="#7f6a49" />
              <Tooltip
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid rgba(195,154,95,0.2)",
                  background: "rgba(255,249,240,0.95)"
                }}
              />
              <Bar dataKey="value" fill="#c39a5f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </ChartCard>

      <ChartCard kicker="Timeline" title="Project Progress">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.progressOverTime} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="completedArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#171d25" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#171d25" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="totalArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c39a5f" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#c39a5f" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(17,20,26,0.08)" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#7f6a49" />
              <YAxis tickLine={false} axisLine={false} stroke="#7f6a49" />
              <Tooltip
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid rgba(195,154,95,0.2)",
                  background: "rgba(255,249,240,0.95)"
                }}
              />
              <Area type="monotone" dataKey="completed" stroke="#171d25" fill="url(#completedArea)" />
              <Area type="monotone" dataKey="total" stroke="#c39a5f" fill="url(#totalArea)" />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </AreaChart>
          </ResponsiveContainer>
      </ChartCard>

      <ChartCard kicker="Flow" title="Task Status Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analytics.statusDistribution}
                dataKey="value"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {analytics.statusDistribution.map((entry, index) => (
                  <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid rgba(195,154,95,0.2)",
                  background: "rgba(255,249,240,0.95)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
      </ChartCard>

      <ChartCard kicker="Load" title="Workload Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.workloadDistribution} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(17,20,26,0.08)" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#7f6a49" />
              <YAxis tickLine={false} axisLine={false} stroke="#7f6a49" />
              <Tooltip
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid rgba(195,154,95,0.2)",
                  background: "rgba(255,249,240,0.95)"
                }}
              />
              <Bar dataKey="value" fill="#b45f3a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </ChartCard>

      <ChartCard kicker="Alignment" title="Voting Agreement">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.votingAgreement} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(17,20,26,0.08)" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="task" hide />
              <YAxis tickLine={false} axisLine={false} stroke="#7f6a49" />
              <Tooltip
                contentStyle={{
                  borderRadius: "18px",
                  border: "1px solid rgba(195,154,95,0.2)",
                  background: "rgba(255,249,240,0.95)"
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="disagreement" fill="#b45f3a" radius={[8, 8, 0, 0]} />
              <Bar dataKey="average" fill="#171d25" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
