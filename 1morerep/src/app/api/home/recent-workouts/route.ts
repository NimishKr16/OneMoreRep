import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mergeActivity } from "@/lib/activity/mergeActivity";
import { CardioLogSummary, WorkoutRow } from "@/types/activity";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 2, 10);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("workouts")
    .select(
      "id,date,workout_type,notes,created_at,sets(id,set_order,reps,weight,exercises(name))"
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit * 3);

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
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (cardioError) {
    return NextResponse.json({ error: cardioError.message }, { status: 500 });
  }

  const merged = mergeActivity(
    (data ?? []) as WorkoutRow[],
    (cardioLogs ?? []) as CardioLogSummary[],
  ).slice(0, limit);

  return NextResponse.json({ data: merged });
}
