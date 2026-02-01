"use client";

import { useMemo, useState } from "react";
import { HiChevronDown } from "react-icons/hi";

export interface WorkoutSet {
  id: string;
  set_order: number;
  reps: number;
  weight: number;
  exercises?: { name: string } | null;
}

export interface WorkoutRow {
  id: string;
  date: string;
  workout_type: string;
  notes: string | null;
  sets: WorkoutSet[];
}

interface WorkoutAccordionCardProps {
  workout: WorkoutRow;
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

export default function WorkoutAccordionCard({
  workout,
}: WorkoutAccordionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-start justify-between gap-4"
        onClick={() => setIsOpen((prev) => !prev)}
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
          <p className="text-white font-semibold text-lg mb-1">
            {summary.exerciseCount} exercises
          </p>
          <p className="text-gray-400 text-sm">
            {summary.setCount} sets • {formatNumber(summary.volume)} kg volume
          </p>
        </div>
        <HiChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-gray-800 px-4 pb-4">
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
