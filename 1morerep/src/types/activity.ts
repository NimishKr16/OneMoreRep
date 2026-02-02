export interface WorkoutSet {
  id: string;
  set_order: number;
  reps: number;
  weight: number;
  exercises?: { name: string } | null;
}

export interface CardioLogSummary {
  id: string;
  type: string;
  duration_minutes: number;
  distance: number | null;
  calories: number | null;
  logged_at: string;
  note: string | null;
  created_at?: string | null;
}

export interface WorkoutRow {
  id: string;
  date: string;
  workout_type: string;
  notes: string | null;
  created_at?: string | null;
  sets: WorkoutSet[];
  cardio?: CardioLogSummary[];
}

export type ActivityItem =
  | {
      kind: "workout";
      workout: WorkoutRow;
    }
  | {
      kind: "cardio";
      cardio: CardioLogSummary;
    };
