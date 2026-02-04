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
  const hasDistance =
    typeof cardio.distance === "number" && cardio.distance > 0;
  const hasDuration =
    typeof cardio.duration_minutes === "number" && cardio.duration_minutes > 0;
  const pace =
    hasDistance && hasDuration
      ? cardio.duration_minutes / (cardio.distance as number)
      : null;
  const paceLabel = pace ? `${pace.toFixed(1)} min/km` : "";

  return (
    <div className="h-fit self-start rounded-xl border border-gray-800 bg-gray-950/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Cardio
        </span>
        <span className="text-xs text-gray-500">•</span>
        <span className="text-xs text-gray-400">
          {formatDate(cardio.logged_at)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <p className="text-white font-semibold text-lg">{cardio.type}</p>
        {paceLabel ? (
          <span className="rounded-full border border-cyan-800/50 bg-cyan-950/40 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
            {paceLabel}
          </span>
        ) : null}
      </div>
      <p className="text-gray-400 text-sm">
        <span className="text-gray-200 font-semibold">
          {cardio.duration_minutes} min
        </span>
        {cardio.distance ? (
          <span className="text-gray-200 font-semibold">
            {` • ${cardio.distance} km`}
          </span>
        ) : null}
        {cardio.calories ? ` • ${cardio.calories} cal` : ""}
      </p>
      {cardio.note && (
        <p className="text-gray-500 text-xs mt-2">{cardio.note}</p>
      )}
    </div>
  );
}
