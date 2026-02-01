"use client";

export interface WorkoutFrequencyPoint {
  date: string;
  label: string;
  count: number;
}

interface WorkoutFrequencyChartProps {
  data: WorkoutFrequencyPoint[];
  isEmpty: boolean;
  onClick?: () => void;
  title?: string;
}

export default function WorkoutFrequencyChart({
  data,
  isEmpty,
  onClick,
  title = "Workout Frequency",
}: WorkoutFrequencyChartProps) {
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-center">
        <p className="text-white font-semibold mb-2">No workouts yet</p>
        <p className="text-gray-400 text-sm">
          Log your first workout to see your weekly rhythm.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((point) => point.count), 1);
  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-900";
    const ratio = count / maxCount;
    if (ratio <= 0.33) return "bg-cyan-900/70";
    if (ratio <= 0.66) return "bg-cyan-700/80";
    return "bg-cyan-500";
  };

  return (
    <div
      className={`w-full rounded-xl border border-gray-800 bg-gray-950/60 p-4 ${
        onClick ? "cursor-pointer hover:border-cyan-500/40" : ""
      }`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        {title}
      </p>
      <div className="grid grid-cols-7 gap-2">
        {data.map((point) => (
          <div key={point.date} className="flex flex-col items-center gap-1">
            <div
              title={`${point.label} • ${point.count} workout${
                point.count === 1 ? "" : "s"
              }`}
              className={`h-8 w-full rounded-md border border-gray-800 ${getColor(
                point.count,
              )}`}
            />
            <span className="text-[10px] text-gray-500">
              {point.count > 0 ? point.label.split(" ")[1] : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
