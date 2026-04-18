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

const formatDateKey = (value: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    .order("workouts(date)", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const buckets = new Map<
    string,
    { oneRepMax: number; volume: number }
  >();

  for (const row of data || []) {
    const reps = Number(row.reps) || 0;
    const weight = Number(row.weight) || 0;
    if (reps <= 0 || weight <= 0) continue;

    const workouts = Array.isArray(row.workouts)
      ? row.workouts[0]
      : row.workouts;
    const dateKey = workouts?.date ? formatDateKey(workouts.date) : "";
    if (!dateKey) continue;

    const oneRepMax = weight * (1 + reps / 30);
    const volume = reps * weight;

    const current = buckets.get(dateKey) || { oneRepMax: 0, volume: 0 };
    current.oneRepMax = Math.max(current.oneRepMax, oneRepMax);
    current.volume += volume;
    buckets.set(dateKey, current);
  }

  const points = Array.from(buckets.entries())
    .map(([date, stats]) => ({
      date,
      oneRepMax: Number(stats.oneRepMax.toFixed(2)),
      volume: Math.round(stats.volume),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ data: points });
}
