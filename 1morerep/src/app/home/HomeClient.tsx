"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Sidebar from "@/components/Sidebar";
import WorkoutCard from "@/components/WorkoutCard";
import BottomNav from "@/components/BottomNav";
import WorkoutFrequencyChart, {
  WorkoutFrequencyPoint,
} from "@/components/home/WorkoutFrequencyChart";
import RecentWorkoutsList from "@/components/home/RecentWorkoutsList";
import { ActivityItem } from "@/types/activity";
import { HiFire } from "react-icons/hi2";
import StreakBadge from "@/components/home/StreakBadge";
import NewUserEmptyState from "@/components/home/NewUserEmptyState";
import { HiMenuAlt2, HiPencilAlt, HiUser } from "react-icons/hi";
import { TbArrowDown, TbArrowRight, TbArrowUp } from "react-icons/tb";

interface HomeClientProps {
  user: User;
}

interface LastWorkoutSet {
  id: string;
  set_order: number;
  exercises?: { name: string } | null;
}

interface LastWorkoutResponse {
  id: string;
  date: string;
  workout_type: string;
  sets: LastWorkoutSet[];
}

interface StrengthMetrics {
  exercise: string;
  maxWeight: number;
  volumeChangePct: number | null;
}

interface BodyweightMetrics {
  latestWeight: number;
  latestLoggedAt: string;
  changePct: number;
}

interface WeeklyVolumeMetrics {
  currentWeekTotal: number;
  previousWeekTotal: number;
  currentToDateVolume: number;
  previousToDateVolume: number;
  changePct: number | null;
  hasComparison: boolean;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function HomeClient({ user }: HomeClientProps) {
  const router = useRouter();
  const strengthExerciseStorageKey = `omr:strengthExercise:${user.id}`;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastWorkout, setLastWorkout] = useState<LastWorkoutResponse | null>(
    null,
  );
  const [isLastWorkoutLoading, setIsLastWorkoutLoading] = useState(true);
  const [lastWorkoutError, setLastWorkoutError] = useState("");
  const [hasLoadedLastWorkout, setHasLoadedLastWorkout] = useState(false);
  const [strengthExercises, setStrengthExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [strengthMetrics, setStrengthMetrics] =
    useState<StrengthMetrics | null>(null);
  const [isStrengthLoading, setIsStrengthLoading] = useState(true);
  const [strengthError, setStrengthError] = useState("");
  const [isStrengthDropdownOpen, setIsStrengthDropdownOpen] = useState(false);
  const [hasLoadedStrengthMetrics, setHasLoadedStrengthMetrics] =
    useState(false);
  const [bodyweightMetrics, setBodyweightMetrics] =
    useState<BodyweightMetrics | null>(null);
  const [isBodyweightLoading, setIsBodyweightLoading] = useState(true);
  const [bodyweightError, setBodyweightError] = useState("");
  const [hasLoadedBodyweight, setHasLoadedBodyweight] = useState(false);
  const [weeklyVolumeMetrics, setWeeklyVolumeMetrics] =
    useState<WeeklyVolumeMetrics | null>(null);
  const [isWeeklyVolumeLoading, setIsWeeklyVolumeLoading] = useState(true);
  const [weeklyVolumeError, setWeeklyVolumeError] = useState("");
  const [hasLoadedWeeklyVolume, setHasLoadedWeeklyVolume] = useState(false);
  const [frequencyPoints, setFrequencyPoints] = useState<
    WorkoutFrequencyPoint[]
  >([]);
  const [isFrequencyLoading, setIsFrequencyLoading] = useState(true);
  const [frequencyError, setFrequencyError] = useState("");
  const [hasLoadedFrequency, setHasLoadedFrequency] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [monthPoints, setMonthPoints] = useState<WorkoutFrequencyPoint[]>([]);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [monthError, setMonthError] = useState("");
  const [recentWorkouts, setRecentWorkouts] = useState<ActivityItem[]>([]);
  const [isRecentWorkoutsLoading, setIsRecentWorkoutsLoading] = useState(true);
  const [recentWorkoutsError, setRecentWorkoutsError] = useState("");
  const [hasLoadedRecentWorkouts, setHasLoadedRecentWorkouts] = useState(false);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [isStreakLoading, setIsStreakLoading] = useState(true);
  const [nudgeMessage, setNudgeMessage] = useState("");

  useEffect(() => {
    const fetchLastWorkout = async () => {
      setIsLastWorkoutLoading(true);
      setLastWorkoutError("");

      try {
        const response = await fetch("/api/home/last-workout");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch last workout");
        }

        setLastWorkout(result?.data || null);
      } catch (err: unknown) {
        setLastWorkoutError(
          getErrorMessage(err, "Failed to fetch last workout"),
        );
      } finally {
        setIsLastWorkoutLoading(false);
        setHasLoadedLastWorkout(true);
      }
    };

    fetchLastWorkout();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(strengthExerciseStorageKey);
    if (stored) {
      setSelectedExercise(stored);
    }
  }, [strengthExerciseStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedExercise) {
      window.localStorage.setItem(strengthExerciseStorageKey, selectedExercise);
    }
  }, [selectedExercise, strengthExerciseStorageKey]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/home/strength-exercises");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch exercises");
        }

        const exercises = result?.data || [];
        setStrengthExercises(exercises);
        if (exercises.length > 0) {
          setSelectedExercise((prev) => {
            if (prev && exercises.includes(prev)) return prev;
            return exercises[0];
          });
        } else {
          setIsStrengthLoading(false);
          setHasLoadedStrengthMetrics(true);
        }
      } catch (err: unknown) {
        setStrengthError(getErrorMessage(err, "Failed to fetch exercises"));
        setIsStrengthLoading(false);
        setHasLoadedStrengthMetrics(true);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    const fetchStrengthMetrics = async () => {
      if (!selectedExercise) {
        setStrengthMetrics(null);
        setIsStrengthLoading(false);
        setHasLoadedStrengthMetrics(true);
        return;
      }

      setIsStrengthLoading(true);
      setStrengthError("");

      try {
        const response = await fetch(
          `/api/home/strength-metrics?exercise=${encodeURIComponent(
            selectedExercise,
          )}`,
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch metrics");
        }

        setStrengthMetrics(result?.data || null);
      } catch (err: unknown) {
        setStrengthError(getErrorMessage(err, "Failed to fetch metrics"));
      } finally {
        setIsStrengthLoading(false);
        setHasLoadedStrengthMetrics(true);
      }
    };

    fetchStrengthMetrics();
  }, [selectedExercise]);

  useEffect(() => {
    const fetchBodyweightMetrics = async () => {
      setIsBodyweightLoading(true);
      setBodyweightError("");

      try {
        const response = await fetch("/api/home/bodyweight-metrics");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch bodyweight");
        }

        setBodyweightMetrics(result?.data || null);
      } catch (err: unknown) {
        setBodyweightError(getErrorMessage(err, "Failed to fetch bodyweight"));
      } finally {
        setIsBodyweightLoading(false);
        setHasLoadedBodyweight(true);
      }
    };

    fetchBodyweightMetrics();
  }, []);

  useEffect(() => {
    const fetchWeeklyVolume = async () => {
      setIsWeeklyVolumeLoading(true);
      setWeeklyVolumeError("");

      try {
        const response = await fetch("/api/home/weekly-volume");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch weekly volume");
        }

        setWeeklyVolumeMetrics(result?.data || null);
      } catch (err: unknown) {
        setWeeklyVolumeError(
          getErrorMessage(err, "Failed to fetch weekly volume"),
        );
      } finally {
        setIsWeeklyVolumeLoading(false);
        setHasLoadedWeeklyVolume(true);
      }
    };

    fetchWeeklyVolume();
  }, []);

  useEffect(() => {
    const fetchFrequency = async () => {
      setIsFrequencyLoading(true);
      setFrequencyError("");

      try {
        const response = await fetch("/api/home/workout-frequency");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch frequency");
        }

        setFrequencyPoints(result?.data || []);
      } catch (err: unknown) {
        setFrequencyError(getErrorMessage(err, "Failed to fetch frequency"));
      } finally {
        setIsFrequencyLoading(false);
        setHasLoadedFrequency(true);
      }
    };

    fetchFrequency();
  }, []);

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      setIsRecentWorkoutsLoading(true);
      setRecentWorkoutsError("");

      try {
        const response = await fetch("/api/home/recent-workouts?limit=2");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch recent workouts");
        }

        setRecentWorkouts(result?.data || []);
      } catch (err: unknown) {
        setRecentWorkoutsError(
          getErrorMessage(err, "Failed to fetch recent workouts"),
        );
      } finally {
        setIsRecentWorkoutsLoading(false);
        setHasLoadedRecentWorkouts(true);
      }
    };

    fetchRecentWorkouts();
  }, []);

  useEffect(() => {
    const fetchStreak = async () => {
      setIsStreakLoading(true);

      try {
        const response = await fetch("/api/home/active-streak");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch streak");
        }

        setStreakCount(result?.data?.streakCount ?? 0);
      } catch {
        setStreakCount(null);
      } finally {
        setIsStreakLoading(false);
      }
    };

    fetchStreak();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sessionKey = "omr:nudgeShown";
    if (window.sessionStorage.getItem(sessionKey)) return;

    const fetchNudge = async () => {
      try {
        const response = await fetch("/api/home/nudge");
        const result = await response.json();

        if (response.ok && result?.data?.message) {
          setNudgeMessage(result.data.message);
        }
      } finally {
        window.sessionStorage.setItem(sessionKey, "true");
      }
    };

    fetchNudge();
  }, []);

  const handleOpenMonthView = async () => {
    setIsMonthOpen(true);

    if (monthPoints.length > 0 || isMonthLoading) return;

    setIsMonthLoading(true);
    setMonthError("");

    try {
      const response = await fetch("/api/home/workout-frequency?range=month");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch monthly frequency");
      }

      setMonthPoints(result?.data || []);
    } catch (err: unknown) {
      setMonthError(getErrorMessage(err, "Failed to fetch monthly frequency"));
    } finally {
      setIsMonthLoading(false);
    }
  };

  const lastWorkoutSummary = useMemo(() => {
    if (!lastWorkout) return null;
    return {
      title: lastWorkout.workout_type || "Workout",
      date: formatDate(lastWorkout.date),
    };
  }, [lastWorkout]);

  const isHomeLoading =
    !hasLoadedLastWorkout ||
    !hasLoadedStrengthMetrics ||
    !hasLoadedBodyweight ||
    !hasLoadedWeeklyVolume ||
    !hasLoadedFrequency ||
    !hasLoadedRecentWorkouts ||
    isFrequencyLoading ||
    isRecentWorkoutsLoading;

  const hasActivity = frequencyPoints.some(
    (point) => point.workoutCount > 0 || point.restCount > 0,
  );

  const isNewUser =
    !isHomeLoading &&
    !lastWorkoutSummary &&
    recentWorkouts.length === 0 &&
    !hasActivity;

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-gray-950 border-b border-gray-900 px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <HiMenuAlt2 className="w-7 h-7" />
            </button>

            {/* Spacer for desktop */}
            <div className="hidden lg:block" />

            {/* User Avatar */}
            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
            >
              <HiUser className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* Dashboard Header */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-3xl font-black text-white tracking-tight">
                Every rep counts.
              </h2>
              <StreakBadge count={streakCount} isLoading={isStreakLoading} />
            </div>
            {nudgeMessage && (
              <div className="mb-6 rounded-xl border border-cyan-900/40 bg-cyan-950/20 px-4 py-3">
                <p className="text-sm text-cyan-200/90">{nudgeMessage}</p>
              </div>
            )}
            {isHomeLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <span className="inline-flex w-8 h-8 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading your dashboard</p>
              </div>
            ) : isNewUser ? (
              <NewUserEmptyState
                eyebrow="Welcome to One More Rep"
                title="Ready for your first workout?"
                motivationLine="Small starts turn into big wins."
                description="One More Rep helps you show up, track progress, and keep the momentum going."
                ctaLabel="Add your first workout"
                ctaHref="/log"
              />
            ) : (
              <>
                {/* Workout Overview - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {/* Card 1 - Last Workout */}
                  <WorkoutCard
                    title="Last Workout"
                    onClick={() => router.push("/workouts")}
                  >
                    <div className="flex flex-col">
                      {isLastWorkoutLoading ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex w-3 h-3 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                            <p className="text-white font-bold text-base">
                              Loading
                            </p>
                          </div>
                          <p className="text-gray-500 text-xs">
                            Fetching session
                          </p>
                        </>
                      ) : lastWorkoutError ? (
                        <>
                          <p className="text-white font-bold text-base mb-1">
                            No data
                          </p>
                          <p className="text-gray-500 text-xs">
                            Try again later
                          </p>
                        </>
                      ) : lastWorkoutSummary ? (
                        <>
                          <p className="text-white font-bold text-base mb-1">
                            {lastWorkoutSummary.title}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {lastWorkoutSummary.date}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-white font-bold text-base mb-1">
                            No workouts yet
                          </p>
                          <p className="text-gray-500 text-xs">
                            Log your first one
                          </p>
                        </>
                      )}
                    </div>
                  </WorkoutCard>

                  {/* Card 2 - Strength Progress */}
                  <WorkoutCard
                    title="Strength"
                    onClick={() => {}}
                    className="relative"
                  >
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsStrengthDropdownOpen(true);
                      }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500/50 transition-colors flex items-center justify-center"
                      aria-label="Edit strength exercise"
                    >
                      <HiPencilAlt className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex flex-col">
                      <p className="text-gray-400 text-xs mb-1">
                        {selectedExercise || "Select exercise"}
                      </p>
                      {isStrengthLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex w-3 h-3 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                          <p className="text-gray-500 text-xs">Loading</p>
                        </div>
                      ) : strengthError ? (
                        <p className="text-gray-500 text-xs">Try again later</p>
                      ) : strengthMetrics ? (
                        <div className="flex items-baseline gap-1">
                          <p className="text-white font-bold text-xl">
                            {strengthMetrics.maxWeight}
                          </p>
                          <p className="text-gray-500 text-xs">kg</p>
                          {typeof strengthMetrics.volumeChangePct ===
                            "number" && (
                            <div className="flex items-center gap-1 ml-2">
                              {strengthMetrics.volumeChangePct >= 0 ? (
                                <TbArrowUp className="text-green-500 text-xs" />
                              ) : (
                                <TbArrowDown className="text-red-400 text-xs" />
                              )}
                              <p
                                className={`text-xs font-semibold ${
                                  strengthMetrics.volumeChangePct >= 0
                                    ? "text-green-500"
                                    : "text-red-400"
                                }`}
                              >
                                {Math.abs(
                                  strengthMetrics.volumeChangePct,
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs">No data yet</p>
                      )}
                    </div>
                  </WorkoutCard>

                  {/* Card 3 - Weekly Volume */}
                  <WorkoutCard
                    title="Weekly Volume"
                    onClick={() => console.log("Weekly Volume clicked")}
                  >
                    <div className="flex flex-col">
                      {isWeeklyVolumeLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex w-3 h-3 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                          <p className="text-gray-500 text-xs">Loading</p>
                        </div>
                      ) : weeklyVolumeError ? (
                        <p className="text-gray-500 text-xs">
                          {weeklyVolumeMetrics
                            ? "Try again later"
                            : "No data yet"}
                        </p>
                      ) : weeklyVolumeMetrics ? (
                        (() => {
                          const isNewWeekNoWorkouts =
                            weeklyVolumeMetrics.currentToDateVolume === 0 &&
                            weeklyVolumeMetrics.previousWeekTotal > 0;
                          const isNoData =
                            weeklyVolumeMetrics.currentToDateVolume === 0 &&
                            weeklyVolumeMetrics.previousWeekTotal === 0;
                          const displayVolume = isNewWeekNoWorkouts
                            ? weeklyVolumeMetrics.previousWeekTotal
                            : weeklyVolumeMetrics.currentToDateVolume;
                          const hasComparison =
                            weeklyVolumeMetrics.hasComparison &&
                            weeklyVolumeMetrics.currentToDateVolume > 0;
                          const changePct = weeklyVolumeMetrics.changePct ?? 0;

                          if (isNoData) {
                            return (
                              <p className="text-gray-500 text-xs">
                                No data yet
                              </p>
                            );
                          }

                          return (
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-1">
                                <p className="text-white font-bold text-xl">
                                  {Math.round(displayVolume).toLocaleString()}
                                </p>
                                <p className="text-gray-500 text-xs">kg</p>
                                {hasComparison ? (
                                  <div className="flex items-center gap-1 ml-2">
                                    {changePct > 0 ? (
                                      <TbArrowUp className="text-cyan-400 text-xs" />
                                    ) : changePct < 0 ? (
                                      <TbArrowDown className="text-cyan-400 text-xs" />
                                    ) : (
                                      <TbArrowRight className="text-cyan-400 text-xs" />
                                    )}
                                    <p className="text-cyan-400 text-xs font-semibold">
                                      {Math.abs(changePct).toFixed(1)}%
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-gray-400 text-xs ml-2">
                                    So far
                                  </p>
                                )}
                              </div>
                              {isNewWeekNoWorkouts && (
                                <p className="text-gray-500 text-xs mt-1">
                                  New week just started
                                </p>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <p className="text-gray-500 text-xs">No data yet</p>
                      )}
                    </div>
                  </WorkoutCard>

                  {/* Card 4 - Bodyweight */}
                  <WorkoutCard
                    title="Bodyweight"
                    onClick={() => router.push("/bodyweight")}
                  >
                    <div className="flex flex-col">
                      {isBodyweightLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex w-3 h-3 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                          <p className="text-gray-500 text-xs">Loading</p>
                        </div>
                      ) : bodyweightError ? (
                        <p className="text-gray-500 text-xs">
                          {bodyweightMetrics
                            ? "Try again later"
                            : "No data yet"}
                        </p>
                      ) : bodyweightMetrics ? (
                        <div className="flex items-baseline gap-1">
                          <p className="text-white font-bold text-xl">
                            {bodyweightMetrics.latestWeight}
                          </p>
                          <p className="text-gray-500 text-xs">kg</p>
                          <div className="flex items-center gap-1 ml-2">
                            {bodyweightMetrics.changePct >= 0 ? (
                              <TbArrowUp className="text-blue-400 text-xs" />
                            ) : (
                              <TbArrowDown className="text-blue-400 text-xs" />
                            )}
                            <p className="text-blue-400 text-xs font-semibold">
                              {Math.abs(bodyweightMetrics.changePct).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs">No data yet</p>
                      )}
                    </div>
                  </WorkoutCard>
                </div>

                {/* Add Workout Button */}
                <Link
                  href="/log"
                  className="w-full mb-8 py-4 rounded-xl bg-linear-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 text-white font-semibold text-base hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/50 transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center justify-center"
                >
                  + Add Workout
                </Link>

                <div className="space-y-6 mb-8">
                  {frequencyError ? (
                    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                      <p className="text-gray-500 text-sm">
                        Unable to load workout frequency.
                      </p>
                    </div>
                  ) : (
                    <WorkoutFrequencyChart
                      data={frequencyPoints}
                      isEmpty={frequencyPoints.every(
                        (point) =>
                          point.workoutCount === 0 && point.restCount === 0,
                      )}
                      onClick={handleOpenMonthView}
                    />
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-white">
                        Recent Workouts
                      </p>
                      <Link
                        href="/workouts"
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        View all
                      </Link>
                    </div>
                    {recentWorkoutsError ? (
                      <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                        <p className="text-gray-500 text-sm">
                          Unable to load recent workouts.
                        </p>
                      </div>
                    ) : (
                      <RecentWorkoutsList workouts={recentWorkouts} />
                    )}
                  </div>
                </div>

                {/* Motivational Banner */}
                <div className="rounded-xl border border-cyan-900/30 bg-linear-to-r from-cyan-950/30 to-blue-950/30 p-6">
                  <p className="text-center text-cyan-400/90 text-sm font-medium flex items-center justify-center gap-2">
                    <HiFire className="text-lg" /> Ready to crush your goals?
                    Let’s get started.
                  </p>
                </div>
              </>
            )}
          </div>
        </main>

        {isStrengthDropdownOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
            <button
              className="absolute inset-0"
              onClick={() => setIsStrengthDropdownOpen(false)}
              aria-label="Close"
            />
            <div className="relative w-full max-w-xs rounded-2xl border border-gray-800 bg-gray-950 p-4 shadow-2xl">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                Choose Exercise
              </p>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {strengthExercises.length === 0 ? (
                  <p className="text-gray-500 text-xs">No exercises yet</p>
                ) : (
                  strengthExercises.map((exercise) => (
                    <button
                      key={exercise}
                      onClick={() => {
                        setSelectedExercise(exercise);
                        setIsStrengthDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        exercise === selectedExercise
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {exercise}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <BottomNav />

        {/* Bottom Navigation Bar */}
        {/* <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950 border-t border-gray-900 pb-safe">
          <div className="flex items-center justify-around px-4 py-3">
            <button
              onClick={() => console.log('Home clicked')}
              className="flex flex-col items-center gap-1 text-cyan-400"
            >
              <HiHome className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => console.log('Progress clicked')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <HiChartBar className="w-6 h-6" />
              <span className="text-xs font-medium">Progress</span>
            </button>

            <button
              onClick={() => console.log('Add Workout clicked')}
              className="flex items-center justify-center w-14 h-14 -mt-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
            >
              <HiPlus className="w-7 h-7" />
            </button>

            <button
              onClick={() => console.log('Body Weight clicked')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <GiWeightScale className="w-6 h-6" />
              <span className="text-xs font-medium">Weight</span>
            </button>

            <button
              onClick={() => console.log('Schedules clicked')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors"
            >
              <TbCalendar className="w-6 h-6" />
              <span className="text-xs font-medium">Schedule</span>
            </button>
          </div>
        </nav> */}
      </div>

      {isMonthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <button
            className="absolute inset-0"
            onClick={() => setIsMonthOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">
                Workout Frequency •{" "}
                {new Date().toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                onClick={() => setIsMonthOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {isMonthLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <span className="inline-flex w-8 h-8 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading month</p>
              </div>
            ) : monthError ? (
              <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                <p className="text-gray-500 text-sm">{monthError}</p>
              </div>
            ) : (
              <WorkoutFrequencyChart
                data={monthPoints}
                isEmpty={monthPoints.every(
                  (point) => point.workoutCount === 0 && point.restCount === 0,
                )}
                title=""
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
