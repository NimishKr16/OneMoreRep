import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const NOTIFICATION_PAYLOAD = {
  title: "Time to train 💪",
  body: "It's time to log today's workout now. Keep the streak going!",
  url: "/log",
};

/**
 * GET /api/cron/notify
 * Called by Vercel Cron at 9pm IST (configured in vercel.json).
 * Sends a push notification to all subscribed users.
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron.
  // On Pro plan, Vercel sends Authorization: Bearer CRON_SECRET.
  // On Hobby plan, no header is sent — we allow it only if CRON_SECRET is not set.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = await createClient();

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, subscription");

  if (error) {
    console.error("[cron/notify] Failed to fetch subscriptions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const results = await Promise.allSettled(
    subscriptions.map((row) =>
      webpush
        .sendNotification(row.subscription, JSON.stringify(NOTIFICATION_PAYLOAD))
        .catch(async (err) => {
          // 410 Gone means the subscription is no longer valid — clean it up
          if (err.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", row.id);
          }
          throw err;
        })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`[cron/notify] Sent: ${sent}, Failed: ${failed}`);
  return NextResponse.json({ sent, failed });
}
