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

export interface ExerciseTrendPoint {
  date: string;
  oneRepMax: number;
  volume: number;
}

interface ExerciseTrendChartProps {
  title: string;
  data: ExerciseTrendPoint[];
  dataKey: "oneRepMax" | "volume";
  stroke: string;
  valueFormatter?: (value: number) => string;
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

export default function ExerciseTrendChart({
  title,
  data,
  dataKey,
  stroke,
  valueFormatter,
}: ExerciseTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-center">
        <p className="text-sm text-white font-semibold">No trend data</p>
        <p className="text-xs text-gray-400">
          Log this exercise to unlock charts.
        </p>
      </div>
    );
  }

  return (
    <div className="h-52 w-full rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        {title}
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
            tick={{ fill: "#9ca3af", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={valueFormatter}
            tick={{ fill: "#9ca3af", fontSize: 10 }}
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
            formatter={(value) => {
              if (typeof value === "number" && valueFormatter) {
                return valueFormatter(value);
              }
              return value as number;
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
