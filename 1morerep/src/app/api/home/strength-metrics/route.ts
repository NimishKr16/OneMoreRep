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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exercise = searchParams.get("exercise")?.trim();

  if (!exercise) {
    return NextResponse.json({ error: "Missing exercise" }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sets")
    .select(
      "reps,weight,workouts!inner(user_id,date),exercises!inner(name)",
    )
    .eq("workouts.user_id", user.id)
    .eq("exercises.name", exercise)
    .order("workouts(date)", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []).map((row: SetRow) => {
    const reps = Number(row.reps) || 0;
    const weight = Number(row.weight) || 0;
    const workouts = Array.isArray(row.workouts)
      ? row.workouts[0]
      : row.workouts;
    const oneRepMax = weight * (1 + reps / 30);
    return {
      reps,
      weight,
      oneRepMax,
      date: workouts?.date,
    };
  });

  if (rows.length === 0) {
    return NextResponse.json({ data: null });
  }

  const maxWeight = Math.max(...rows.map((r) => r.weight));

  // Group by workout date to get max 1RM per workout
  const oneRmByDate = rows.reduce(
    (acc, row) => {
      if (!row.date) return acc;
      if (!acc[row.date]) {
        acc[row.date] = 0;
      }
      acc[row.date] = Math.max(acc[row.date], row.oneRepMax);
      return acc;
    },
    {} as Record<string, number>,
  );

  const workoutOneRms = Object.entries(oneRmByDate)
    .map(([date, oneRepMax]) => ({ date, oneRepMax }))
    .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

  if (workoutOneRms.length === 0) {
    return NextResponse.json({
      data: {
        exercise,
        maxWeight,
        volumeChangePct: null,
      },
    });
  }

  const latestOneRm = workoutOneRms[0].oneRepMax;
  const previousOneRm =
    workoutOneRms.length > 1 ? workoutOneRms[1].oneRepMax : null;

  const volumeChangePct =
    previousOneRm && previousOneRm > 0
      ? ((latestOneRm - previousOneRm) / previousOneRm) * 100
      : null;

  return NextResponse.json({
    data: {
      exercise,
      maxWeight,
      volumeChangePct,
    },
  });
}
