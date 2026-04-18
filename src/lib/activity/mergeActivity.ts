import { ActivityItem, CardioLogSummary, WorkoutRow } from "@/types/activity";

const getSortValue = (value?: string | null) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export const mergeActivity = (
  workouts: WorkoutRow[],
  cardioLogs: CardioLogSummary[],
): ActivityItem[] => {
  const workoutsByDate = new Map<string, WorkoutRow[]>();
  const workoutItems: ActivityItem[] = workouts.map((workout) => {
    const list = workoutsByDate.get(workout.date) || [];
    list.push(workout);
    workoutsByDate.set(workout.date, list);

    return { kind: "workout", workout: { ...workout, cardio: [] } };
  });

  const cardioOnlyItems: ActivityItem[] = [];

  for (const cardio of cardioLogs) {
    const dateKey = cardio.logged_at;
    const workoutsOnDate = workoutsByDate.get(dateKey);

    if (workoutsOnDate && workoutsOnDate.length > 0) {
      const targetWorkout = workoutsOnDate[0];
      const workoutItem = workoutItems.find(
        (item) =>
          item.kind === "workout" && item.workout.id === targetWorkout.id,
      );
      if (workoutItem && workoutItem.kind === "workout") {
        workoutItem.workout.cardio = [
          ...(workoutItem.workout.cardio || []),
          cardio,
        ];
      }
      continue;
    }

    cardioOnlyItems.push({ kind: "cardio", cardio });
  }

  return [...workoutItems, ...cardioOnlyItems].sort((a, b) => {
    const aDate = a.kind === "workout" ? a.workout.date : a.cardio.logged_at;
    const bDate = b.kind === "workout" ? b.workout.date : b.cardio.logged_at;
    const dateDiff = bDate.localeCompare(aDate);
    if (dateDiff !== 0) return dateDiff;

    const aCreated =
      a.kind === "workout" ? a.workout.created_at : a.cardio.created_at;
    const bCreated =
      b.kind === "workout" ? b.workout.created_at : b.cardio.created_at;

    return getSortValue(bCreated) - getSortValue(aCreated);
  });
};
