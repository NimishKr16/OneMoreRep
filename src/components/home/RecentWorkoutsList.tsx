"use client";

import { useEffect, useState } from "react";
import WorkoutAccordionCard from "@/components/workouts/WorkoutAccordionCard";
import CardioLogCard from "@/components/cardio/CardioLogCard";
import WorkoutActionsModal from "@/components/workouts/WorkoutActionsModal";
import { ActivityItem, CardioLogSummary, WorkoutRow } from "@/types/activity";

interface RecentWorkoutsListProps {
  workouts: ActivityItem[];
}

type SelectedActivity =
  | { kind: "workout"; value: WorkoutRow }
  | { kind: "cardio"; value: CardioLogSummary };

export default function RecentWorkoutsList({
  workouts,
}: RecentWorkoutsListProps) {
  const [items, setItems] = useState<ActivityItem[]>(workouts);
  const [selectedActivity, setSelectedActivity] =
    useState<SelectedActivity | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    setItems(workouts);
  }, [workouts]);

  const openWorkoutActions = (workout: WorkoutRow) => {
    setSelectedActivity({ kind: "workout", value: workout });
    setDeleteError("");
    setIsActionsOpen(true);
  };

  const openCardioActions = (cardio: CardioLogSummary) => {
    setSelectedActivity({ kind: "cardio", value: cardio });
    setDeleteError("");
    setIsActionsOpen(true);
  };

  const closeActions = () => {
    if (isDeleting) return;
    setIsActionsOpen(false);
    setSelectedActivity(null);
    setDeleteError("");
  };

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;

    setDeleteError("");
    setIsDeleting(true);

    try {
      const endpoint =
        selectedActivity.kind === "workout"
          ? `/api/workouts/${selectedActivity.value.id}`
          : `/api/cardio/${selectedActivity.value.id}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            (selectedActivity.kind === "workout"
              ? "Failed to delete workout"
              : "Failed to delete cardio"),
        );
      }

      const deletedId = selectedActivity.value.id;
      const deletedKind = selectedActivity.kind;
      setItems((prev) =>
        prev.filter((item) => {
          if (item.kind !== deletedKind) return true;
          if (item.kind === "workout") {
            return item.workout.id !== deletedId;
          }
          return item.cardio.id !== deletedId;
        }),
      );
      setIsActionsOpen(false);
      setSelectedActivity(null);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : selectedActivity.kind === "workout"
            ? "Failed to delete workout"
            : "Failed to delete cardio",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (items.length === 0) {
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
    <>
      <div className="space-y-3">
        {items.map((item) =>
          item.kind === "workout" ? (
            <WorkoutAccordionCard
              key={item.workout.id}
              workout={item.workout}
              onOpenActions={openWorkoutActions}
            />
          ) : (
            <CardioLogCard
              key={item.cardio.id}
              cardio={item.cardio}
              onOpenActions={openCardioActions}
            />
          ),
        )}
      </div>

      <WorkoutActionsModal
        isOpen={isActionsOpen}
        itemLabel={
          selectedActivity?.kind === "workout"
            ? selectedActivity.value.workout_type || "Workout"
            : selectedActivity?.kind === "cardio"
              ? selectedActivity.value.type || "Cardio"
              : "Activity"
        }
        itemKind={selectedActivity?.kind || "workout"}
        isDeleting={isDeleting}
        error={deleteError}
        onClose={closeActions}
        onDelete={handleDeleteActivity}
      />
    </>
  );
}
