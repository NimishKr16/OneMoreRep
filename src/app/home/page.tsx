import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const rawWorkoutLocation = user.user_metadata?.workout_location;
  const preferredWorkoutLocation: "home" | "gym" | null =
    rawWorkoutLocation === "home" || rawWorkoutLocation === "gym"
      ? rawWorkoutLocation
      : null;

  return (
    <HomeClient
      user={user}
      preferredWorkoutLocation={preferredWorkoutLocation}
    />
  );
}
