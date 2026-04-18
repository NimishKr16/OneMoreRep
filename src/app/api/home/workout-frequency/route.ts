import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const formatLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

const formatLocalKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "14d";
  const monthParam = searchParams.get("month");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let windowStart: Date;
  let windowEnd: Date;
  let daysCount: number;

  if (range === "month") {
    const base = monthParam ? new Date(`${monthParam}-01`) : new Date();
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    windowStart = start;
    windowEnd = end;
    daysCount = end.getDate();
  } else {
    const now = new Date();
    windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - 13); // last 14 days
    windowStart.setHours(0, 0, 0, 0);
    windowEnd = new Date(now);
    windowEnd.setHours(0, 0, 0, 0);
    daysCount = 14;
  }

  const startKey = formatLocalKey(windowStart);
  const endKey = formatLocalKey(windowEnd);

  const [
    { data: workouts, error: workoutError },
    { data: restDays, error: restError },
    { data: cardioLogs, error: cardioError },
  ] = await Promise.all([
    supabase
      .from("workouts")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", startKey)
      .lte("date", endKey)
      .order("date", { ascending: true }),
    supabase
      .from("rest_days")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", startKey)
      .lte("date", endKey),
    supabase
      .from("cardio_logs")
      .select("logged_at")
      .eq("user_id", user.id)
      .gte("logged_at", startKey)
      .lte("logged_at", endKey),
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

  const buckets = new Map<
    string,
    { workoutCount: number; restCount: number }
  >();
  for (let i = 0; i < daysCount; i += 1) {
    const day = new Date(windowStart);
    day.setDate(windowStart.getDate() + i);
    buckets.set(formatLocalKey(day), { workoutCount: 0, restCount: 0 });
  }

  for (const workout of workouts || []) {
    const workoutDate = parseLocalDate(workout.date);
    const key = formatLocalKey(workoutDate);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.workoutCount += 1;
    }
  }

  for (const restDay of restDays || []) {
    const restDate = parseLocalDate(restDay.date);
    const key = formatLocalKey(restDate);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.restCount += 1;
    }
  }

  for (const cardio of cardioLogs || []) {
    const cardioDate = parseLocalDate(cardio.logged_at);
    const key = formatLocalKey(cardioDate);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.workoutCount += 1;
    }
  }

  const points = Array.from(buckets.entries()).map(([key, bucket]) => {
    const date = parseLocalDate(key);
    return {
      date: key,
      label: formatLabel(date),
      workoutCount: bucket.workoutCount,
      restCount: bucket.restCount,
    };
  });

  return NextResponse.json({ data: points });
}
