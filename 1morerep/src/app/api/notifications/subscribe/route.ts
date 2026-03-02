import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/notifications/subscribe
 * Saves a push subscription for the authenticated user.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const subscription = await request.json();

  if (!subscription?.endpoint) {
    return NextResponse.json(
      { error: "Invalid subscription object" },
      { status: 400 }
    );
  }

  // Remove any existing subscription for this user first (handles re-subscribes
  // without needing a UNIQUE constraint on user_id in the DB schema)
  const { error: deleteError } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase
    .from("push_subscriptions")
    .insert({ user_id: user.id, subscription });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
