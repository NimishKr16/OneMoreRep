"use client";

interface BodyWeightCurrentCardProps {
  weight: number | null;
  loggedAt: string | null;
  isEmpty: boolean;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function BodyWeightCurrentCard({
  weight,
  loggedAt,
  isEmpty,
}: BodyWeightCurrentCardProps) {
  if (isEmpty) {
    return (
      <div className="rounded-xl border border-cyan-900/40 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-4">
        <p className="text-cyan-300 font-semibold mb-2">No entries yet</p>
        <p className="text-gray-400 text-sm">
          Start tracking today and see your progress over time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
        Current Weight
      </p>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-black text-white">{weight}</span>
        <span className="text-gray-400 text-sm">kg</span>
      </div>
      <p className="text-gray-500 text-sm">
        Logged on {loggedAt ? formatDate(loggedAt) : "-"}
      </p>
    </div>
  );
}
