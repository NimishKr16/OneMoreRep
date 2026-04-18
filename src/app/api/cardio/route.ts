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
    .from("cardio_logs")
    .select(
      "id,type,duration_minutes,distance,calories,logged_at,note,created_at"
    )
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const type = body?.type as string | undefined;
  const durationMinutes = Number(body?.duration_minutes);
  const loggedAt = body?.logged_at as string | undefined;
  const distance =
    body?.distance === null || body?.distance === undefined
      ? null
      : Number(body.distance);
  const calories =
    body?.calories === null || body?.calories === undefined
      ? null
      : Number(body.calories);
  const note = (body?.note as string | undefined) || null;

  if (!type || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return NextResponse.json(
      { error: "Type and duration are required" },
      { status: 400 },
    );
  }

  if (!loggedAt) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("cardio_logs")
    .upsert(
      {
        user_id: user.id,
        type,
        duration_minutes: durationMinutes,
        distance: Number.isFinite(distance) ? distance : null,
        calories: Number.isFinite(calories) ? calories : null,
        logged_at: loggedAt,
        note,
      },
      { onConflict: "user_id,logged_at,type" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { success: true } });
}
