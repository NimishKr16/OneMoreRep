import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (start: Date) => {
  const d = new Date(start);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const sumVolume = (rows: any[]) =>
  rows.reduce((total, row) => {
    const reps = Number(row.reps) || 0;
    const weight = Number(row.weight) || 0;
    return total + reps * weight;
  }, 0);

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = new Date();
  const currentWeekStart = startOfWeek(now);
  const currentWeekEnd = endOfWeek(currentWeekStart);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekEnd = endOfWeek(previousWeekStart);

  const currentWeekRange = {
    start: toDateString(currentWeekStart),
    end: toDateString(currentWeekEnd),
  };
  const previousWeekRange = {
    start: toDateString(previousWeekStart),
    end: toDateString(previousWeekEnd),
  };

  const { data: currentRows, error: currentError } = await supabase
    .from("sets")
    .select("reps,weight,workouts!inner(date,user_id)")
    .eq("workouts.user_id", user.id)
    .gte("workouts.date", currentWeekRange.start)
    .lte("workouts.date", currentWeekRange.end);

  if (currentError) {
    return NextResponse.json({ error: currentError.message }, { status: 500 });
  }

  const { data: previousRows, error: previousError } = await supabase
    .from("sets")
    .select("reps,weight,workouts!inner(date,user_id)")
    .eq("workouts.user_id", user.id)
    .gte("workouts.date", previousWeekRange.start)
    .lte("workouts.date", previousWeekRange.end);

  if (previousError) {
    return NextResponse.json({ error: previousError.message }, { status: 500 });
  }

  const currentVolume = sumVolume(currentRows || []);
  const previousVolume = sumVolume(previousRows || []);

  const changePct =
    previousVolume > 0
      ? ((currentVolume - previousVolume) / previousVolume) * 100
      : 0;

  return NextResponse.json({
    data: {
      currentVolume,
      changePct,
    },
  });
}
