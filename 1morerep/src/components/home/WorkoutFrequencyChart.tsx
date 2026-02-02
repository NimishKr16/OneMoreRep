"use client";

export interface WorkoutFrequencyPoint {
  date: string;
  label: string;
  workoutCount: number;
  restCount: number;
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
        <p className="text-white font-semibold mb-2">No activity yet</p>
        <p className="text-gray-400 text-sm">
          Log a workout or rest day to see your weekly rhythm.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((point) => point.workoutCount), 1);
  const getColor = (workoutCount: number, restCount: number) => {
    if (workoutCount === 0 && restCount === 0) return "bg-gray-900";
    if (workoutCount === 0 && restCount > 0) return "bg-indigo-400/70";
    const ratio = workoutCount / maxCount;
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
              title={`${point.label} • ${
                point.workoutCount > 0
                  ? `${point.workoutCount} workout${
                      point.workoutCount === 1 ? "" : "s"
                    }`
                  : point.restCount > 0
                    ? "Rest day"
                    : "No activity"
              }`}
              className={`h-8 w-full rounded-md border border-gray-800 ${getColor(
                point.workoutCount,
                point.restCount,
              )}`}
            />
            <span className="text-[10px] text-gray-500">
              {point.workoutCount > 0 || point.restCount > 0
                ? point.label.split(" ")[1]
                : ""}
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
