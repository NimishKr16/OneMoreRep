import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing workout id" }, { status: 400 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: workout, error: workoutLookupError } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (workoutLookupError) {
    return NextResponse.json({ error: workoutLookupError.message }, { status: 500 });
  }

  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  const { error: setsDeleteError } = await supabase
    .from("sets")
    .delete()
    .eq("workout_id", id);

  if (setsDeleteError) {
    return NextResponse.json({ error: setsDeleteError.message }, { status: 500 });
  }

  const { error: workoutDeleteError } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (workoutDeleteError) {
    return NextResponse.json({ error: workoutDeleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
