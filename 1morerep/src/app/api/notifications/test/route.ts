import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

/**
 * POST /api/notifications/test
 * DEV ONLY — sends a test push notification to the currently logged-in user.
 * Remove or protect this route before going to production.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: row, error: queryError } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", user.id)
    .single();

  if (queryError) {
    console.error("[notifications/test] Supabase query error:", queryError);
  }

  if (!row) {
    return NextResponse.json(
      { error: "No subscription found. Toggle notifications OFF then ON again in the Schedules tab." },
      { status: 404 }
    );
  }

  try {
    await webpush.sendNotification(
      row.subscription,
      JSON.stringify({
        title: "Test notification 🔔",
        body: "Push notifications are working! Time to log your workout.",
        url: "/log",
      })
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
