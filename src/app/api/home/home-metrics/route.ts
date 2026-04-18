import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const HOME_WORKOUT_TYPES = [
  "Pilates",
  "HIIT",
  "Core",
  "Mobility",
  "Calesthenics",
  "Recovery",
];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekStart = (date: Date) => {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const day = current.getDay();
  const diff = day === 0 ? 6 : day - 1;
  current.setDate(current.getDate() - diff);
  return current;
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
  const weekStart = getWeekStart(today);
  const weekStartKey = formatDateKey(weekStart);
  const todayKey = formatDateKey(today);

  const { data: weeklyRows, error: weeklyError } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", user.id)
    .in("workout_type", HOME_WORKOUT_TYPES)
    .gte("date", weekStartKey)
    .lte("date", todayKey);

  if (weeklyError) {
    return NextResponse.json({ error: weeklyError.message }, { status: 500 });
  }

  const { data: typeRows, error: typeError } = await supabase
    .from("workouts")
    .select("workout_type")
    .eq("user_id", user.id)
    .in("workout_type", HOME_WORKOUT_TYPES);

  if (typeError) {
    return NextResponse.json({ error: typeError.message }, { status: 500 });
  }

  const counts = new Map<string, number>();
  for (const type of HOME_WORKOUT_TYPES) {
    counts.set(type, 0);
  }

  for (const row of typeRows || []) {
    const type = row.workout_type;
    if (!type || !counts.has(type)) continue;
    counts.set(type, (counts.get(type) || 0) + 1);
  }

  const mostFrequent = HOME_WORKOUT_TYPES.filter((type) => (counts.get(type) || 0) > 0)
    .sort((a, b) => {
      const diff = (counts.get(b) || 0) - (counts.get(a) || 0);
      if (diff !== 0) return diff;
      return HOME_WORKOUT_TYPES.indexOf(a) - HOME_WORKOUT_TYPES.indexOf(b);
    })
    .slice(0, 3);

  return NextResponse.json({
    data: {
      weeklyWorkouts: (weeklyRows || []).length,
      mostFrequent,
    },
  });
}
