"use client";

interface BodyWeightHistoryItem {
  id: string;
  weight: number;
  logged_at: string;
}

interface BodyWeightHistoryProps {
  items: BodyWeightHistoryItem[];
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function BodyWeightHistory({ items }: BodyWeightHistoryProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
        History
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">
              {formatDate(item.logged_at)}
            </span>
            <span className="text-white text-sm font-semibold">
              {item.weight} kg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
