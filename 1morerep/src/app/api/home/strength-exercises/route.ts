import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    .select("exercises(name),workouts!inner(user_id)")
    .eq("workouts.user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const names = (data || [])
    .map((row: any) => row.exercises?.name)
    .filter(Boolean);

  const uniqueNames = Array.from(new Set(names)).sort();

  return NextResponse.json({ data: uniqueNames });
}
