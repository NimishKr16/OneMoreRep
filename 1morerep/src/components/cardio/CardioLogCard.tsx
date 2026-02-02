"use client";

import { CardioLogSummary } from "@/types/activity";

interface CardioLogCardProps {
  cardio: CardioLogSummary;
}

const formatDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function CardioLogCard({ cardio }: CardioLogCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Cardio
        </span>
        <span className="text-xs text-gray-500">•</span>
        <span className="text-xs text-gray-400">
          {formatDate(cardio.logged_at)}
        </span>
      </div>
      <p className="text-white font-semibold text-lg mb-1">{cardio.type}</p>
      <p className="text-gray-400 text-sm">
        {cardio.duration_minutes} min
        {cardio.distance ? ` • ${cardio.distance} km` : ""}
        {cardio.calories ? ` • ${cardio.calories} cal` : ""}
      </p>
      {cardio.note && (
        <p className="text-gray-500 text-xs mt-2">{cardio.note}</p>
      )}
    </div>
  );
}
