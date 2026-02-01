import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface BodyWeightPayload {
  weight: number;
  logged_at: string;
}

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
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: BodyWeightPayload;
  try {
    payload = (await request.json()) as BodyWeightPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!payload?.logged_at || typeof payload?.weight !== "number") {
    return NextResponse.json({ error: "Missing bodyweight data" }, { status: 400 });
  }

  if (payload.weight <= 0) {
    return NextResponse.json({ error: "Weight must be greater than 0" }, { status: 400 });
  }

  const { error } = await supabase.from("body_weight_logs").insert({
    user_id: user.id,
    weight: payload.weight,
    logged_at: payload.logged_at,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
