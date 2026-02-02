import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const date = body?.date as string | undefined;
  const note = (body?.note as string | undefined) || null;

  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("rest_days")
    .upsert(
      {
        user_id: user.id,
        date,
        note,
      },
      { onConflict: "user_id,date" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { success: true } });
}
