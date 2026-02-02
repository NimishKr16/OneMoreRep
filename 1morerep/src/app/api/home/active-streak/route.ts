import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const today = new Date();
  const lookbackDays = 365;
  const startDate = toDateString(addDays(today, -lookbackDays));

  const [
    { data: workoutRows, error: workoutError },
    { data: restRows, error: restError },
    { data: cardioRows, error: cardioError },
  ] = await Promise.all([
    supabase
      .from("workouts")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", startDate),
    supabase
      .from("rest_days")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", startDate),
    supabase
      .from("cardio_logs")
      .select("logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", startDate),
  ]);

  if (workoutError) {
    return NextResponse.json({ error: workoutError.message }, { status: 500 });
  }

  if (restError) {
    return NextResponse.json({ error: restError.message }, { status: 500 });
  }

  if (cardioError) {
    return NextResponse.json({ error: cardioError.message }, { status: 500 });
  }

  const activeDates = new Set<string>();

  (workoutRows || []).forEach((row) => {
    if (row?.date) activeDates.add(row.date);
  });

  (restRows || []).forEach((row) => {
    if (row?.date) activeDates.add(row.date);
  });

  (cardioRows || []).forEach((row) => {
    if (row?.logged_at) activeDates.add(row.logged_at);
  });

  let streakCount = 0;
  for (let offset = 0; offset <= lookbackDays; offset += 1) {
    const dateKey = toDateString(addDays(today, -offset));
    if (activeDates.has(dateKey)) {
      streakCount += 1;
    } else {
      break;
    }
  }

  return NextResponse.json({ data: { streakCount } });
}
