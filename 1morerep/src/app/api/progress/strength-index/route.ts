import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const WEEK_START_DAY = 1; // Monday

const toDateKey = (date: Date) => date.toISOString().split("T")[0];

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

const startOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - WEEK_START_DAY + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type SetRow = {
  reps: number | null;
  weight: number | null;
  workouts:
    | {
        user_id: string;
        date: string;
      }
    | {
        user_id: string;
        date: string;
      }[]
    | null;
};

type WeekStats = {
  score: number;
  totalSets: number;
  topE1rm: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedWeeks = Math.max(
    1,
    Math.min(4, Number(searchParams.get("weeks")) || 4),
  );

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("sets")
    .select("reps,weight,workouts!inner(user_id,date)")
    .eq("workouts.user_id", user.id)
    .gte("workouts.date", toDateKey(oneYearAgo))
    .order("workouts(date)", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const weekMap = new Map<string, WeekStats>();

  for (const row of data || []) {
    const workouts = Array.isArray(row.workouts)
      ? row.workouts[0]
      : row.workouts;
    const workoutDate = workouts?.date;
    if (!workoutDate) continue;

    const weekStart = startOfWeek(parseLocalDate(workoutDate));
    const key = toDateKey(weekStart);

    const reps = Number(row.reps) || 0;
    const weight = Number(row.weight) || 0;
    const e1rm = reps > 0 && weight > 0 ? weight * (1 + reps / 30) : 0;

    const stats = weekMap.get(key) || {
      score: 0,
      totalSets: 0,
      topE1rm: 0,
    };

    stats.score += e1rm;
    if (reps > 0) {
      stats.totalSets += 1;
    }
    if (e1rm > stats.topE1rm) {
      stats.topE1rm = e1rm;
    }

    weekMap.set(key, stats);
  }

  if (weekMap.size === 0) {
    return NextResponse.json({ data: null });
  }

  const weekKeysAsc = Array.from(weekMap.keys()).sort((a, b) =>
    a.localeCompare(b),
  );
  const weeksWithData = weekKeysAsc.length;
  const windowWeeks = Math.min(requestedWeeks, weeksWithData);

  const scores = weekKeysAsc.map((key) => weekMap.get(key)?.score ?? 0);
  const prefix: number[] = [0];
  for (const score of scores) {
    prefix.push(prefix[prefix.length - 1] + score);
  }

  const currentSum =
    prefix[prefix.length - 1] - prefix[prefix.length - 1 - windowWeeks];
  const currentAvg = currentSum / windowWeeks;

  let maxAvg = 0;
  for (let i = 0; i <= scores.length - windowWeeks; i += 1) {
    const windowSum = prefix[i + windowWeeks] - prefix[i];
    maxAvg = Math.max(maxAvg, windowSum / windowWeeks);
  }

  const hasPreviousWindow = scores.length >= windowWeeks * 2;
  const previousAvg = hasPreviousWindow
    ? (prefix[scores.length - windowWeeks] -
        prefix[scores.length - windowWeeks * 2]) /
      windowWeeks
    : null;

  const changePct =
    previousAvg && previousAvg > 0
      ? ((currentAvg - previousAvg) / previousAvg) * 100
      : null;

  const strengthIndexRaw = maxAvg > 0 ? (currentAvg / maxAvg) * 100 : null;
  const strengthIndex =
    strengthIndexRaw !== null ? clamp(strengthIndexRaw, 0, 120) : null;

  const currentWindowKeys = weekKeysAsc.slice(-windowWeeks);
  const windowStartKey = currentWindowKeys[0];
  const windowEndKey = currentWindowKeys[currentWindowKeys.length - 1];
  const windowEndDate = addDays(parseLocalDate(windowEndKey), 6);

  let totalSets = 0;
  let totalE1rmVolume = 0;
  let topE1rm: number | null = null;

  for (const key of currentWindowKeys) {
    const stats = weekMap.get(key);
    if (!stats) continue;
    totalSets += stats.totalSets;
    totalE1rmVolume += stats.score;
    topE1rm = topE1rm === null ? stats.topE1rm : Math.max(topE1rm, stats.topE1rm);
  }

  const hasIndex = strengthIndex !== null && windowWeeks >= 2;

  return NextResponse.json({
    data: {
      strengthIndex: hasIndex ? strengthIndex : null,
      changePct: hasIndex ? changePct : null,
      weeksUsed: windowWeeks,
      weeksWithData,
      windowStart: windowStartKey,
      windowEnd: toDateKey(windowEndDate),
      totalSets,
      totalE1rmVolume,
      topE1rm,
      hasIndex,
    },
  });
}
