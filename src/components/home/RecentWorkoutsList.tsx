"use client";

import WorkoutAccordionCard from "@/components/workouts/WorkoutAccordionCard";
import CardioLogCard from "@/components/cardio/CardioLogCard";
import { ActivityItem } from "@/types/activity";

interface RecentWorkoutsListProps {
  workouts: ActivityItem[];
}

export default function RecentWorkoutsList({
  workouts,
}: RecentWorkoutsListProps) {
  if (workouts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-center">
        <p className="text-white font-semibold mb-2">No activity yet</p>
        <p className="text-gray-400 text-sm">
          Log a workout or cardio session to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((item) =>
        item.kind === "workout" ? (
          <WorkoutAccordionCard key={item.workout.id} workout={item.workout} />
        ) : (
          <CardioLogCard key={item.cardio.id} cardio={item.cardio} />
        ),
      )}
    </div>
  );
}
