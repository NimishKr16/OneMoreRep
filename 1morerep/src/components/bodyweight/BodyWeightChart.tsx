"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface BodyWeightPoint {
  date: string;
  weight: number;
}

interface BodyWeightChartProps {
  data: BodyWeightPoint[];
}

const formatXAxis = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatTooltipLabel = (label: React.ReactNode) => {
  if (typeof label !== "string") return "";
  return formatXAxis(label);
};

export default function BodyWeightChart({ data }: BodyWeightChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="h-56 w-full rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        Trend
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "#0b0f14",
              border: "1px solid #1f2937",
              borderRadius: 8,
              color: "#e5e7eb",
              fontSize: 12,
            }}
            labelFormatter={formatTooltipLabel}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
