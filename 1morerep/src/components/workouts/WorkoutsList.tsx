"use client";

import WorkoutAccordionCard, {
  WorkoutRow,
} from "@/components/workouts/WorkoutAccordionCard";

interface WorkoutsListProps {
  workouts: WorkoutRow[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
}

export default function WorkoutsList({
  workouts,
  isLoading,
  error,
  onRetry,
}: WorkoutsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 rounded-xl border border-gray-800 bg-gray-950/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-red-400 text-sm mb-3">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg border border-red-400/40 text-red-300 text-sm hover:border-red-300 hover:text-red-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-6 text-center">
        <p className="text-white font-semibold mb-2">No workouts yet</p>
        <p className="text-gray-400 text-sm">
          Log your first workout to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <WorkoutAccordionCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
