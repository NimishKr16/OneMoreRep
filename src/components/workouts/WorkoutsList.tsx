"use client";

import { useState } from "react";
import WorkoutAccordionCard from "@/components/workouts/WorkoutAccordionCard";
import CardioLogCard from "@/components/cardio/CardioLogCard";
import WorkoutActionsModal from "@/components/workouts/WorkoutActionsModal";
import { ActivityItem, WorkoutRow } from "@/types/activity";

interface WorkoutsListProps {
  workouts: ActivityItem[];
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
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRow | null>(
    null,
  );
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const openActions = (workout: WorkoutRow) => {
    setSelectedWorkout(workout);
    setDeleteError("");
    setIsActionsOpen(true);
  };

  const closeActions = () => {
    if (isDeleting) return;
    setIsActionsOpen(false);
    setSelectedWorkout(null);
    setDeleteError("");
  };

  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;

    setDeleteError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/workouts/${selectedWorkout.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete workout");
      }

      setIsActionsOpen(false);
      setSelectedWorkout(null);
      onRetry();
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete workout",
      );
    } finally {
      setIsDeleting(false);
    }
  };

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
        <p className="text-white font-semibold mb-2">No activity yet</p>
        <p className="text-gray-400 text-sm">
          Log a workout or cardio session to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {workouts.map((item) =>
          item.kind === "workout" ? (
            <WorkoutAccordionCard
              key={item.workout.id}
              workout={item.workout}
              onLongPress={openActions}
            />
          ) : (
            <CardioLogCard key={item.cardio.id} cardio={item.cardio} />
          ),
        )}
      </div>

      <WorkoutActionsModal
        isOpen={isActionsOpen}
        workoutType={selectedWorkout?.workout_type || "Workout"}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={closeActions}
        onDelete={handleDeleteWorkout}
      />
    </>
  );
}
