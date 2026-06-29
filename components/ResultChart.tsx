/**
 * Recharts bar chart showing accuracy per topic on the results page.
 */

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopicScore } from "@/types/assessment";

interface ResultChartProps {
  topicScores: TopicScore[];
}

export default function ResultChart({ topicScores }: ResultChartProps) {
  const data = topicScores.map((t) => ({
    topic: t.topic,
    accuracy: t.accuracy,
    label: `${t.correct}/${t.total}`,
  }));
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const grid = isDark ? "#27272a" : "#e4e4e7";
  const tick = isDark ? "#a1a1aa" : "#71717a";
  const tooltipBackground = isDark ? "#111827" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e4e4e7";
  const tooltipText = isDark ? "#f4f4f5" : "#18181b";

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis
            dataKey="topic"
            tick={{ fontSize: 12, fill: tick }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: tick }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value, _name, item) => [
              `${value}% (${item.payload.label} correct)`,
              "Accuracy",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBackground,
              color: tooltipText,
              fontSize: "13px",
            }}
          />
          <Bar dataKey="accuracy" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={64} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
