import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SaveWorkoutPayload {
  date: string;
  workoutType: string;
  exercises: {
    name: string;
    sets: { reps: number; weight: number }[];
  }[];
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: SaveWorkoutPayload;
  try {
    payload = (await request.json()) as SaveWorkoutPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!payload?.date || !payload?.workoutType) {
    return NextResponse.json({ error: "Missing workout details" }, { status: 400 });
  }

  if (!payload.exercises || payload.exercises.length === 0) {
    return NextResponse.json({ error: "Add at least one exercise" }, { status: 400 });
  }

  const invalidExercise = payload.exercises.find(
    (ex) => !ex.name?.trim() || !ex.sets || ex.sets.length === 0
  );

  if (invalidExercise) {
    return NextResponse.json(
      { error: "Each exercise must have a name and at least one set" },
      { status: 400 }
    );
  }

  try {
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        date: payload.date,
        workout_type: payload.workoutType,
        notes: null,
      })
      .select()
      .single();

    if (workoutError) throw workoutError;

    for (const exercise of payload.exercises) {
      const { data: exerciseRow, error: exerciseError } = await supabase
        .from("exercises")
        .upsert(
          { name: exercise.name.trim() },
          {
            onConflict: "name",
          }
        )
        .select("id")
        .single();

      if (exerciseError) throw exerciseError;
      if (!exerciseRow?.id) {
        throw new Error("Failed to resolve exercise ID");
      }

      const setsToInsert = exercise.sets.map((set, index) => ({
        workout_id: workout.id,
        exercise_id: exerciseRow.id,
        set_order: index + 1,
        reps: set.reps,
        weight: set.weight,
      }));

      const { error: setsError } = await supabase
        .from("sets")
        .insert(setsToInsert);

      if (setsError) throw setsError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save workout" },
      { status: 500 }
    );
  }
}
