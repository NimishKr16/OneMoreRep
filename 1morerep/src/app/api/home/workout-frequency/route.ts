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

  const { data, error } = await supabase
    .from("workouts")
    .select("date")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const workouts = data || [];
  if (workouts.length === 0) {
    return NextResponse.json({ data: [] });
  }

  let windowStart: Date;
  let daysCount: number;

  if (range === "month") {
    const base = monthParam ? new Date(`${monthParam}-01`) : new Date();
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    windowStart = start;
    daysCount = end.getDate();
  } else {
    const now = new Date();
    windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() - 13); // last 14 days
    windowStart.setHours(0, 0, 0, 0);
    daysCount = 14;
  }

  const buckets = new Map<string, number>();
  for (let i = 0; i < daysCount; i += 1) {
    const day = new Date(windowStart);
    day.setDate(windowStart.getDate() + i);
    buckets.set(formatLocalKey(day), 0);
  }

  for (const workout of workouts) {
    const workoutDate = parseLocalDate(workout.date);
    const key = formatLocalKey(workoutDate);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
  }

  const points = Array.from(buckets.entries()).map(([key, count]) => {
    const date = parseLocalDate(key);
    return { date: key, label: formatLabel(date), count };
  });

  return NextResponse.json({ data: points });
}
