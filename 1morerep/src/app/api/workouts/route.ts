import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeActivity } from "@/lib/activity/mergeActivity";
import { CardioLogSummary, WorkoutRow } from "@/types/activity";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const workoutType = searchParams.get("workout_type")?.trim();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let query = supabase
    .from("workouts")
    .select(
      "id,date,workout_type,notes,created_at,sets(id,set_order,reps,weight,exercises(name))"
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("set_order", { foreignTable: "sets", ascending: true });

  if (workoutType) {
    query = query.eq("workout_type", workoutType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: cardioLogs, error: cardioError } = await supabase
    .from("cardio_logs")
    .select(
      "id,type,duration_minutes,distance,calories,logged_at,note,created_at"
    )
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (cardioError) {
    return NextResponse.json({ error: cardioError.message }, { status: 500 });
  }

  const merged = mergeActivity(
    (data ?? []) as WorkoutRow[],
    (cardioLogs ?? []) as CardioLogSummary[],
  );

  const filtered = workoutType
    ? merged.filter((item) => item.kind === "workout")
    : merged;

  return NextResponse.json({ data: filtered });
}
