"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HiDotsVertical } from "react-icons/hi";
import { CardioLogSummary } from "@/types/activity";

interface CardioLogCardProps {
  cardio: CardioLogSummary;
  onOpenActions?: (cardio: CardioLogSummary) => void;
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

export default function CardioLogCard({
  cardio,
  onOpenActions,
}: CardioLogCardProps) {
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
    <div className="relative w-full min-h-12 rounded-xl border border-gray-800 bg-gray-950/60 p-4 pr-20">
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
        <p className="mt-2 truncate text-gray-500 text-xs">{cardio.note}</p>
      )}

      {onOpenActions && (
        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-gray-500 transition-colors hover:bg-gray-800/60 hover:text-gray-200"
                aria-label="Open cardio actions"
              >
                <HiDotsVertical className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-40 rounded-lg border border-gray-800 bg-gray-950 p-1 shadow-xl"
              >
                <DropdownMenu.Item
                  onSelect={() => onOpenActions(cardio)}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-300 outline-none transition-colors data-highlighted:bg-red-500/20 data-highlighted:text-red-200"
                >
                  Delete cardio
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}
    </div>
  );
}
