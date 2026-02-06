import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const WEEK_START_DAY = 1; // Monday

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - WEEK_START_DAY + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (start: Date) => {
  const d = new Date(start);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

type VolumeRow = { reps?: number | null; weight?: number | null };

const sumVolume = (rows: VolumeRow[]) =>
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

  const todayKey = toDateString(now);
  const dayOffset = Math.floor(
    (now.getTime() - currentWeekStart.getTime()) / (24 * 60 * 60 * 1000),
  );
  const previousWeekSameDay = new Date(previousWeekStart);
  previousWeekSameDay.setDate(previousWeekStart.getDate() + dayOffset);

  const currentWeekRange = {
    start: toDateString(currentWeekStart),
    end: toDateString(currentWeekEnd),
  };
  const previousWeekRange = {
    start: toDateString(previousWeekStart),
    end: toDateString(previousWeekEnd),
  };
  const currentToDateRange = {
    start: toDateString(currentWeekStart),
    end: todayKey,
  };
  const previousToDateRange = {
    start: toDateString(previousWeekStart),
    end: toDateString(previousWeekSameDay),
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

  const { data: currentToDateRows, error: currentToDateError } = await supabase
    .from("sets")
    .select("reps,weight,workouts!inner(date,user_id)")
    .eq("workouts.user_id", user.id)
    .gte("workouts.date", currentToDateRange.start)
    .lte("workouts.date", currentToDateRange.end);

  if (currentToDateError) {
    return NextResponse.json(
      { error: currentToDateError.message },
      { status: 500 },
    );
  }

  const { data: previousToDateRows, error: previousToDateError } =
    await supabase
      .from("sets")
      .select("reps,weight,workouts!inner(date,user_id)")
      .eq("workouts.user_id", user.id)
      .gte("workouts.date", previousToDateRange.start)
      .lte("workouts.date", previousToDateRange.end);

  if (previousToDateError) {
    return NextResponse.json(
      { error: previousToDateError.message },
      { status: 500 },
    );
  }

  const currentWeekTotal = sumVolume(currentRows || []);
  const previousWeekTotal = sumVolume(previousRows || []);
  const currentToDateVolume = sumVolume(currentToDateRows || []);
  const previousToDateVolume = sumVolume(previousToDateRows || []);

  const hasComparison =
    previousToDateVolume > 0 && currentToDateVolume > 0;
  const changePct = hasComparison
    ? ((currentToDateVolume - previousToDateVolume) / previousToDateVolume) *
      100
    : null;

  return NextResponse.json({
    data: {
      currentWeekTotal,
      previousWeekTotal,
      currentToDateVolume,
      previousToDateVolume,
      changePct,
      hasComparison,
    },
  });
}
