import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const NUDGES = [
  "Feeling recovered? A light session can help build momentum.",
  "Rest is important. When you’re ready, your next session awaits.",
  "Even a short session helps keep the habit alive.",
];

const NUDGES_FIRST_WORKOUT = [
  "Rest is important. When you’re ready, your next session awaits.",
  "Even a short session helps keep the habit alive.",
];

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const today = new Date();
  const last7Start = toDateString(addDays(today, -6));

  const [
    { data: restRows, error: restError },
    { data: workoutRows, error: workoutError },
  ] = await Promise.all([
    supabase
      .from("rest_days")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", last7Start),
    supabase
      .from("workouts")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", last7Start),
  ]);

  if (restError) {
    return NextResponse.json({ error: restError.message }, { status: 500 });
  }

  if (workoutError) {
    return NextResponse.json({ error: workoutError.message }, { status: 500 });
  }

  const restDates = new Set<string>();
  (restRows || []).forEach((row) => {
    if (row?.date) restDates.add(row.date);
  });

  const workoutCount = (workoutRows || []).length;

  let consecutiveRest = 0;
  for (let offset = 0; offset <= 30; offset += 1) {
    const dateKey = toDateString(addDays(today, -offset));
    if (restDates.has(dateKey)) {
      consecutiveRest += 1;
    } else {
      break;
    }
  }

  let restDaysLast7 = 0;
  for (let offset = 0; offset <= 6; offset += 1) {
    const dateKey = toDateString(addDays(today, -offset));
    if (restDates.has(dateKey)) restDaysLast7 += 1;
  }

  const shouldNudge =
    consecutiveRest >= 3 || restDaysLast7 >= 5 || workoutCount === 0;

  if (!shouldNudge) {
    return NextResponse.json({ data: { message: null } });
  }

  const pool = workoutCount === 0 ? NUDGES_FIRST_WORKOUT : NUDGES;
  const message = pool[Math.floor(Math.random() * pool.length)];

  return NextResponse.json({ data: { message } });
}
