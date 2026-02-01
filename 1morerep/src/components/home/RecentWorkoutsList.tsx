"use client";

import WorkoutAccordionCard, {
  WorkoutRow,
} from "@/components/workouts/WorkoutAccordionCard";

interface RecentWorkoutsListProps {
  workouts: WorkoutRow[];
}

export default function RecentWorkoutsList({
  workouts,
}: RecentWorkoutsListProps) {
  if (workouts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-center">
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
