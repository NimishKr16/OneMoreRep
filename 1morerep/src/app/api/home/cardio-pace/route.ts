import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const WEEK_START_DAY = 1;

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

type PaceRow = {
  duration_minutes: number | null;
  distance: number | null;
};

const computeAvgPace = (rows: PaceRow[]) => {
  let totalDuration = 0;
  let totalDistance = 0;

  rows.forEach((row) => {
    const duration = Number(row.duration_minutes) || 0;
    const distance = Number(row.distance) || 0;
    if (duration > 0 && distance > 0) {
      totalDuration += duration;
      totalDistance += distance;
    }
  });

  if (totalDistance === 0) return null;
  return totalDuration / totalDistance;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = new Date();
  const previousWeekStart = startOfWeek(now);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekEnd = endOfWeek(previousWeekStart);

  const { data: allRows, error: allError } = await supabase
    .from("cardio_logs")
    .select("duration_minutes,distance")
    .eq("user_id", user.id)
    .gt("duration_minutes", 0)
    .gt("distance", 0);

  if (allError) {
    return NextResponse.json({ error: allError.message }, { status: 500 });
  }

  const { data: lastWeekRows, error: lastWeekError } = await supabase
    .from("cardio_logs")
    .select("duration_minutes,distance")
    .eq("user_id", user.id)
    .gt("duration_minutes", 0)
    .gt("distance", 0)
    .gte("logged_at", toDateString(previousWeekStart))
    .lte("logged_at", toDateString(previousWeekEnd));

  if (lastWeekError) {
    return NextResponse.json({ error: lastWeekError.message }, { status: 500 });
  }

  const overallAvgPace = computeAvgPace(allRows || []);
  const lastWeekAvgPace = computeAvgPace(lastWeekRows || []);
  const hasLastWeek = typeof lastWeekAvgPace === "number";
  const changePct =
    hasLastWeek && overallAvgPace !== null
      ? ((overallAvgPace - lastWeekAvgPace) / lastWeekAvgPace) * 100
      : null;

  return NextResponse.json({
    data: {
      overallAvgPace,
      lastWeekAvgPace,
      changePct,
      hasLastWeek,
    },
  });
}
