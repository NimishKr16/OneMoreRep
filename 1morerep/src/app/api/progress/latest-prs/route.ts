import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SetRow = {
  reps: number | null;
  weight: number | null;
  workouts:
    | {
        user_id: string;
        date: string;
      }
    | {
        user_id: string;
        date: string;
      }[]
    | null;
  exercises:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

type PrEvent = {
  exercise: string;
  value: number;
  date: string;
  reps: number;
  weight: number;
};

const toDateKey = (value: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getEventTime = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const isLater = (candidate: PrEvent, current: PrEvent | null) => {
  if (!current) return true;
  const candidateTime = getEventTime(candidate.date);
  const currentTime = getEventTime(current.date);
  if (candidateTime !== currentTime) {
    return candidateTime > currentTime;
  }
  return candidate.value > current.value;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sets")
    .select("reps,weight,workouts!inner(user_id,date),exercises!inner(name)")
    .eq("workouts.user_id", user.id)
    .order("workouts(date)", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bestOneRmByExercise = new Map<string, number>();
  const bestFiveRmByExercise = new Map<string, number>();
  let latestOneRm: PrEvent | null = null;
  let latestFiveRm: PrEvent | null = null;

  for (const row of data || []) {
    const reps = Number(row.reps) || 0;
    const weight = Number(row.weight) || 0;
    if (reps <= 0 || weight <= 0) continue;

    const workouts = Array.isArray(row.workouts)
      ? row.workouts[0]
      : row.workouts;
    const exerciseRow = Array.isArray(row.exercises)
      ? row.exercises[0]
      : row.exercises;

    const dateKey = workouts?.date ? toDateKey(workouts.date) : "";
    const exercise = exerciseRow?.name?.trim();

    if (!dateKey || !exercise) continue;

    const oneRm = weight * (1 + reps / 30);

    const prevOneRm = bestOneRmByExercise.get(exercise) || 0;
    if (oneRm > prevOneRm) {
      bestOneRmByExercise.set(exercise, oneRm);
      const candidate: PrEvent = {
        exercise,
        value: Number(oneRm.toFixed(2)),
        date: dateKey,
        reps,
        weight,
      };
      if (isLater(candidate, latestOneRm)) {
        latestOneRm = candidate;
      }
    }

    if (reps >= 5) {
      const prevFive = bestFiveRmByExercise.get(exercise) || 0;
      if (weight > prevFive) {
        bestFiveRmByExercise.set(exercise, weight);
        const candidate: PrEvent = {
          exercise,
          value: weight,
          date: dateKey,
          reps,
          weight,
        };
        if (isLater(candidate, latestFiveRm)) {
          latestFiveRm = candidate;
        }
      }
    }
  }

  return NextResponse.json({
    data: {
      oneRmPr: latestOneRm,
      fiveRmPr: latestFiveRm,
    },
  });
}
