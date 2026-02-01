import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("body_weight_logs")
    .select("id,weight,logged_at,created_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ data: null });
  }

  const latest = data[0];
  const latestDate = startOfDay(new Date(latest.logged_at));
  const targetDate = addDays(latestDate, -7);

  const sevenDaysAgoLog = data.find((entry) => {
    const entryDate = startOfDay(new Date(entry.logged_at));
    return entryDate.getTime() === targetDate.getTime();
  });

  const changePct = sevenDaysAgoLog
    ? ((latest.weight - sevenDaysAgoLog.weight) / sevenDaysAgoLog.weight) * 100
    : 0;

  return NextResponse.json({
    data: {
      latestWeight: latest.weight,
      latestLoggedAt: latest.logged_at,
      changePct,
    },
  });
}
