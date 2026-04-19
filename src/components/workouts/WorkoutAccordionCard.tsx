"use client";

import { useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HiChevronDown, HiDotsVertical } from "react-icons/hi";
import { CardioLogSummary, WorkoutRow, WorkoutSet } from "@/types/activity";

interface WorkoutAccordionCardProps {
  workout: WorkoutRow;
  onOpenActions?: (workout: WorkoutRow) => void;
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

const formatNumber = (value: number) => value.toLocaleString();

const formatCardioSummary = (cardioLogs: CardioLogSummary[]) => {
  if (cardioLogs.length === 0) return "";
  if (cardioLogs.length === 1) {
    const log = cardioLogs[0];
    return `Cardio • ${log.type} • ${log.duration_minutes} min`;
  }
  return `Cardio • ${cardioLogs.length} sessions`;
};

export default function WorkoutAccordionCard({
  workout,
  onOpenActions,
}: WorkoutAccordionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isHomeWorkout = !workout.sets || workout.sets.length === 0;

  const setsByExercise = useMemo(() => {
    const groups: Record<string, WorkoutSet[]> = {};
    for (const set of workout.sets || []) {
      const name = set.exercises?.name || "Unknown";
      if (!groups[name]) groups[name] = [];
      groups[name].push(set);
    }

    for (const name of Object.keys(groups)) {
      groups[name].sort((a, b) => a.set_order - b.set_order);
    }

    return groups;
  }, [workout.sets]);

  const summary = useMemo(() => {
    const setCount = workout.sets?.length || 0;
    const exerciseCount = Object.keys(setsByExercise).length;
    const volume = (workout.sets || []).reduce(
      (total, set) => total + (set.reps || 0) * (set.weight || 0),
      0,
    );

    return {
      setCount,
      exerciseCount,
      volume,
    };
  }, [setsByExercise, workout.sets]);

  const handleCardClick = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-950/60">
      <button
        className={`flex w-full min-h-12 items-start gap-4 p-4 text-left ${
          onOpenActions ? "pr-20" : "pr-14"
        }`}
        onClick={handleCardClick}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              {workout.workout_type}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">
              {formatDate(workout.date)}
            </span>
          </div>
          {isHomeWorkout ? (
            <>
              <p className="text-white font-semibold text-lg mb-1">
                Home workout
              </p>
              <p className="truncate text-gray-400 text-sm">
                {workout.notes?.trim() || "Logged from home session"}
              </p>
            </>
          ) : (
            <>
              <p className="text-white font-semibold text-lg mb-1">
                {summary.exerciseCount} exercises
              </p>
              <p className="text-gray-400 text-sm">
                {summary.setCount} sets • {formatNumber(summary.volume)} kg
                volume
              </p>
            </>
          )}
          {workout.cardio && workout.cardio.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-900/40 bg-cyan-950/20 px-3 py-1 text-xs font-semibold text-cyan-200">
              <span className="uppercase tracking-wider text-[10px] text-cyan-300">
                Cardio
              </span>
              <span className="text-cyan-200">
                {formatCardioSummary(workout.cardio).replace("Cardio • ", "")}
              </span>
            </div>
          )}
        </div>
        <HiChevronDown
          className={`absolute top-4 h-5 w-5 text-gray-400 transition-transform ${
            onOpenActions ? "right-12" : "right-4"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {onOpenActions && (
        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-gray-500 transition-colors hover:bg-gray-800/60 hover:text-gray-200"
                aria-label="Open workout actions"
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
                  onSelect={() => onOpenActions(workout)}
                  className="cursor-pointer rounded-md px-3 py-2 text-sm text-red-300 outline-none transition-colors data-highlighted:bg-red-500/20 data-highlighted:text-red-200"
                >
                  Delete workout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}

      {isOpen && (
        <div className="border-t border-gray-800 px-4 pb-4">
          {isHomeWorkout ? (
            <div className="mt-3 rounded-lg border border-cyan-900/40 bg-cyan-950/10 p-3">
              <p className="text-xs uppercase tracking-wider text-cyan-300 mb-1">
                Session Type
              </p>
              <p className="text-sm font-semibold text-cyan-100">
                Home workout
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {Object.entries(setsByExercise).map(([name, sets]) => (
                <div
                  key={name}
                  className="rounded-lg border border-gray-800 bg-black/40 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <span className="text-gray-500 text-xs">
                      {sets.length} set{sets.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {sets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between text-sm text-gray-400"
                      >
                        <span>Set {set.set_order}</span>
                        <span>
                          {set.reps} reps × {set.weight} kg
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {workout.notes && (
            <div className="mt-4 rounded-lg border border-gray-800 bg-black/40 p-3">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                Notes
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {workout.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
