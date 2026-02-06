import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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

  // Calculate 7-day rolling average if we have enough data
  const now = new Date();
  const sevenDaysAgo = addDays(now, -7);
  const fourteenDaysAgo = addDays(now, -14);

  const recentLogs = data.filter((entry) => {
    const entryDate = new Date(entry.logged_at);
    return entryDate >= sevenDaysAgo;
  });

  const previousLogs = data.filter((entry) => {
    const entryDate = new Date(entry.logged_at);
    return entryDate >= fourteenDaysAgo && entryDate < sevenDaysAgo;
  });

  let changePct = 0;

  if (recentLogs.length >= 2 && previousLogs.length >= 2) {
    // Use 7-day rolling average
    const recentAvg =
      recentLogs.reduce((sum, entry) => sum + entry.weight, 0) /
      recentLogs.length;
    const previousAvg =
      previousLogs.reduce((sum, entry) => sum + entry.weight, 0) /
      previousLogs.length;
    changePct = ((recentAvg - previousAvg) / previousAvg) * 100;
  } else if (data.length >= 2) {
    // Fallback: compare last two measurements
    const latestWeight = data[0].weight;
    const previousWeight = data[1].weight;
    changePct = ((latestWeight - previousWeight) / previousWeight) * 100;
  }

  return NextResponse.json({
    data: {
      latestWeight: latest.weight,
      latestLoggedAt: latest.logged_at,
      changePct,
    },
  });
}
