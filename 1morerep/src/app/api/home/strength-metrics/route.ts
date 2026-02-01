import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    .select("reps,weight,exercises!inner(name),workouts!inner(user_id)")
    .eq("workouts.user_id", user.id)
    .eq("exercises.name", exercise);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []).map((row: any) => {
    const reps = Number(row.reps) || 0;
    const weight = Number(row.weight) || 0;
    return {
      reps,
      weight,
      volume: reps * weight,
    };
  });

  if (rows.length === 0) {
    return NextResponse.json({ data: null });
  }

  const maxWeight = Math.max(...rows.map((r) => r.weight));

  const volumes = rows
    .map((r) => r.volume)
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => b - a);

  const bestVolume = volumes[0] || 0;
  const prevBestVolume = volumes.length > 1 ? volumes[1] : null;

  const volumeChangePct =
    prevBestVolume && prevBestVolume > 0
      ? ((bestVolume - prevBestVolume) / prevBestVolume) * 100
      : null;

  return NextResponse.json({
    data: {
      exercise,
      maxWeight,
      volumeChangePct,
    },
  });
}
