import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workoutType = searchParams.get("workout_type")?.trim();

  if (!workoutType) {
    return NextResponse.json({ error: "Missing workout type" }, { status: 400 });
  }

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
      "id,date,workout_type,notes,created_at,sets(id,set_order,reps,weight,exercises(name))",
    )
    .eq("user_id", user.id)
    .eq("workout_type", workoutType)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ data: null });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
