"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiChevronLeft, HiPlus, HiTrash } from "react-icons/hi";
import ExerciseAutocomplete from "@/components/ExerciseAutocomplete";
import BottomNav from "@/components/BottomNav";

// Hardcoded exercise list for autocomplete (UI only)
export const EXERCISE_LIST = [
  "Barbell Squat",
  "Barbell Hip Thrust",
  "Leg Press",
  "Romanian Deadlift",
  "Leg Curl",
  "Leg Extension",
  "Bench Press",
  "Incline Bench Press",
  "Dumbbell Press",
  "Chest Fly",
  "Cable Fly",
  "Deadlift",
  "Barbell Row",
  "Pull Up",
  "Lat Pulldown",
  "Seated Row",
  "Overhead Press",
  "Lateral Raise",
  "Front Raise",
  "Face Pull",
  "Barbell Curl",
  "Dumbbell Curl",
  "Cable Pullover",
  "Split Squats",
  "Forearm Curl",
  "Calf Raise",
  "Cable Row",
  "Concentration Curl",
  "Preacher Curl",
  "Hammer Curl",
  "Tricep Pushdown",
  "Skull Crusher",
  "Dips",
  "Shoulder Press",
  "Shoulder Shrug",
  "Rear Delt Fly",
];

const WORKOUT_TYPES = [
  "Push",
  "Pull",
  "Legs",
  "Chest",
  "Back",
  "Arms",
  "Shoulders",
  "Full Body",
  "Upper Body",
  "Lower Body",
];

interface Set {
  id: string;
  reps: number;
  weight: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface WorkoutDraft {
  savedAt: number;
  workoutDate: string;
  workoutType: string;
  customWorkoutType?: string;
  exercises: Exercise[];
}

const DRAFT_STORAGE_KEY = "omr:workoutDraft";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const getToday = () => new Date().toISOString().split("T")[0];

const createEmptyExercise = (): Exercise => ({
  id: crypto.randomUUID(),
  name: "",
  sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0 }],
});

const normalizeDraftExercises = (items: Exercise[]) => {
  if (!Array.isArray(items) || items.length === 0)
    return [createEmptyExercise()];

  return items.map((exercise) => ({
    id: exercise.id || crypto.randomUUID(),
    name: exercise.name || "",
    sets:
      Array.isArray(exercise.sets) && exercise.sets.length > 0
        ? exercise.sets.map((set) => ({
            id: set.id || crypto.randomUUID(),
            reps: Number(set.reps) || 0,
            weight: Number(set.weight) || 0,
          }))
        : [{ id: crypto.randomUUID(), reps: 0, weight: 0 }],
  }));
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function LogWorkoutPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workoutDate, setWorkoutDate] = useState(getToday());
  const [workoutType, setWorkoutType] = useState("Push");
  const [customWorkoutType, setCustomWorkoutType] = useState("");
  const [logMode, setLogMode] = useState<"workout" | "cardio" | "rest">(
    "workout",
  );
  const [restDate, setRestDate] = useState(getToday());
  const [restNote, setRestNote] = useState("");
  const [cardioDate, setCardioDate] = useState(getToday());
  const [cardioType, setCardioType] = useState("Treadmill");
  const [cardioDuration, setCardioDuration] = useState("");
  const [cardioDistance, setCardioDistance] = useState("");
  const [cardioCalories, setCardioCalories] = useState("");
  const [cardioNote, setCardioNote] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    createEmptyExercise(),
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestSaving, setIsRestSaving] = useState(false);
  const [isCardioSaving, setIsCardioSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      setHasRestoredDraft(true);
      return;
    }

    try {
      const draft = JSON.parse(raw) as WorkoutDraft;
      if (!draft?.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasRestoredDraft(true);
        return;
      }

      if (draft.workoutDate || (draft as { date?: string }).date) {
        setWorkoutDate(draft.workoutDate || (draft as { date?: string }).date!);
      }
      if (draft.workoutType) setWorkoutType(draft.workoutType);
      if (draft.customWorkoutType)
        setCustomWorkoutType(draft.customWorkoutType);
      if (draft.exercises) {
        setExercises(normalizeDraftExercises(draft.exercises));
      }
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } finally {
      setHasRestoredDraft(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasRestoredDraft || logMode !== "workout") return;

    const draft: WorkoutDraft = {
      savedAt: Date.now(),
      workoutDate,
      workoutType,
      customWorkoutType,
      exercises,
    };

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [
    workoutDate,
    workoutType,
    customWorkoutType,
    exercises,
    hasRestoredDraft,
    logMode,
  ]);

  const resetWorkoutFields = () => {
    setWorkoutDate(getToday());
    setWorkoutType("Push");
    setCustomWorkoutType("");
    setExercises([createEmptyExercise()]);
  };

  const resetRestFields = () => {
    setRestDate(getToday());
    setRestNote("");
  };

  const resetCardioFields = () => {
    setCardioDate(getToday());
    setCardioType("Treadmill");
    setCardioDuration("");
    setCardioDistance("");
    setCardioCalories("");
    setCardioNote("");
  };

  const handleModeChange = (mode: "workout" | "cardio" | "rest") => {
    setError("");
    setLogMode(mode);

    if (mode !== "workout") {
      resetWorkoutFields();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    if (mode !== "rest") {
      resetRestFields();
    }

    if (mode !== "cardio") {
      resetCardioFields();
    }
  };

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "workout" || mode === "cardio" || mode === "rest") {
      if (mode !== logMode) {
        handleModeChange(mode);
      }
    }
  }, [searchParams, logMode]);

  // Add new exercise
  const addExercise = () => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      name: "",
      sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0 }],
    };
    setExercises([...exercises, newExercise]);
  };

  // Remove exercise
  const removeExercise = (exerciseId: string) => {
    const remaining = exercises.filter((ex) => ex.id !== exerciseId);
    if (remaining.length === 0) {
      setExercises([createEmptyExercise()]);
      return;
    }
    setExercises(remaining);
  };

  // Update exercise name
  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(
      exercises.map((ex) => (ex.id === exerciseId ? { ...ex, name } : ex)),
    );
  };

  // Add set to exercise
  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                { id: crypto.randomUUID(), reps: 0, weight: 0 },
              ],
            }
          : ex,
      ),
    );
  };

  // Remove set from exercise
  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex,
      ),
    );
  };

  // Update set values
  const updateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: number,
  ) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s,
              ),
            }
          : ex,
      ),
    );
  };

  // Save workout to Supabase
  const saveWorkout = async () => {
    // Validation
    if (exercises.length === 0) {
      setError("Add at least one exercise");
      return;
    }

    const resolvedWorkoutType =
      workoutType === "Custom" ? customWorkoutType.trim() : workoutType;

    if (!resolvedWorkoutType) {
      setError("Workout type is required");
      return;
    }

    const invalidExercise = exercises.find((ex) => !ex.name.trim());
    if (invalidExercise) {
      setError("All exercises must have a name");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: workoutDate,
          workoutType: resolvedWorkoutType,
          exercises: exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets.map((set) => ({
              reps: set.reps,
              weight: set.weight,
            })),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to save workout");
      }

      // Success - redirect to home
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      router.push("/home");
    } catch (err: unknown) {
      console.error("Save error:", err);
      setError(getErrorMessage(err, "Failed to save workout"));
      setIsSaving(false);
    }
  };

  const saveRestDay = async () => {
    setError("");
    setIsRestSaving(true);

    try {
      const response = await fetch("/api/rest-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: restDate,
          note: restNote.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to log rest day");
      }

      router.push("/home");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to log rest day"));
      setIsRestSaving(false);
    }
  };

  const saveCardio = async () => {
    if (!cardioType.trim()) {
      setError("Select a cardio type");
      return;
    }

    const durationValue = Number(cardioDuration);
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      setError("Duration is required");
      return;
    }

    setError("");
    setIsCardioSaving(true);

    try {
      const response = await fetch("/api/cardio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: cardioType,
          duration_minutes: durationValue,
          distance: cardioDistance ? Number(cardioDistance) : null,
          calories: cardioCalories ? Number(cardioCalories) : null,
          logged_at: cardioDate,
          note: cardioNote.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to save cardio");
      }

      router.push("/home");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save cardio"));
      setIsCardioSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950 border-b border-gray-900 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <HiChevronLeft className="w-7 h-7" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Log Workout
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-2xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-950 p-2 flex">
          <button
            type="button"
            onClick={() => handleModeChange("workout")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              logMode === "workout"
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Workout
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("cardio")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              logMode === "cardio"
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Cardio
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("rest")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              logMode === "rest"
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Rest Day
          </button>
        </div>

        {logMode === "cardio" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Cardio Type
                </label>
                <select
                  value={cardioType}
                  onChange={(e) => setCardioType(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                >
                  {[
                    "Treadmill",
                    "Cycling",
                    "Run",
                    "Walk",
                    "Rowing",
                    "Elliptical",
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={cardioDuration}
                    onChange={(e) => setCardioDuration(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cardioDistance}
                    onChange={(e) => setCardioDistance(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                    Calories
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cardioCalories}
                    onChange={(e) => setCardioCalories(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                    Date
                  </label>
                  <input
                    type="date"
                    value={cardioDate}
                    onChange={(e) => setCardioDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Note (optional)
                </label>
                <textarea
                  value={cardioNote}
                  onChange={(e) => setCardioNote(e.target.value)}
                  placeholder="Effort, pace, incline, etc."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={saveCardio}
              disabled={isCardioSaving}
              className="w-full py-4 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isCardioSaving ? "Saving..." : "Save Cardio"}
            </button>
          </div>
        ) : logMode === "rest" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
              <p className="text-sm font-semibold text-white mb-1">
                Recovery day
              </p>
              <p className="text-xs text-gray-500">
                Rest counts as an active day. Log a note if you’d like.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  value={restDate}
                  onChange={(e) => setRestDate(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Optional note
                </label>
                <textarea
                  value={restNote}
                  onChange={(e) => setRestNote(e.target.value)}
                  placeholder="Recovery, mobility, sleep, etc."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={saveRestDay}
              disabled={isRestSaving}
              className="w-full py-4 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRestSaving ? "Logging..." : "Log Rest Day"}
            </button>
          </div>
        ) : (
          <>
            {/* Workout Details */}
            <div className="mb-6 p-4 rounded-xl bg-gray-950 border border-gray-800">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Workout Details
              </h2>

              {/* Date */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Workout Type */}
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Workout Type
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                >
                  {WORKOUT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="Custom">Custom</option>
                </select>
                {workoutType === "Custom" && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                      Custom Type
                    </label>
                    <input
                      type="text"
                      value={customWorkoutType}
                      onChange={(e) => setCustomWorkoutType(e.target.value)}
                      placeholder="e.g. HIIT, Mobility"
                      className="w-full max-w-xs px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4 mb-6">
              {exercises.map((exercise, exerciseIndex) => (
                <div
                  key={exercise.id}
                  className="p-4 rounded-xl bg-gray-950 border border-gray-800"
                >
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                        Exercise {exerciseIndex + 1}
                      </label>
                      <ExerciseAutocomplete
                        value={exercise.name}
                        onChange={(name) =>
                          updateExerciseName(exercise.id, name)
                        }
                        exercises={EXERCISE_LIST}
                      />
                    </div>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="mt-7 p-2 text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Remove exercise"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2 mb-3">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={set.id} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-8">
                          {setIndex + 1}
                        </span>

                        {/* Reps Input */}
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Reps"
                            value={set.reps || ""}
                            onChange={(e) =>
                              updateSet(
                                exercise.id,
                                set.id,
                                "reps",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg bg-black border border-gray-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        {/* Weight Input */}
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={set.weight || ""}
                            onChange={(e) =>
                              updateSet(
                                exercise.id,
                                set.id,
                                "weight",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg bg-black border border-gray-800 text-white text-sm focus:border-cyan-500 focus:outline-none"
                          />
                        </div>

                        {/* Remove Set */}
                        {exercise.sets.length > 1 && (
                          <button
                            onClick={() => removeSet(exercise.id, set.id)}
                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                            aria-label="Remove set"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Set Button */}
                  <button
                    onClick={() => addSet(exercise.id)}
                    className="w-full py-2 rounded-lg border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all text-sm font-medium"
                  >
                    + Add Set
                  </button>
                </div>
              ))}
            </div>

            {/* Add Exercise Button */}
            <button
              onClick={addExercise}
              className="w-full mb-6 py-4 rounded-xl bg-linear-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 text-white font-semibold text-base hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/50 transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <HiPlus className="w-5 h-5" />
              Add Exercise
            </button>

            {/* Save Button */}
            <button
              onClick={saveWorkout}
              disabled={isSaving || exercises.length === 0}
              className="w-full py-4 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? "Saving..." : "Save Workout"}
            </button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function LogWorkoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LogWorkoutPageClient />
    </Suspense>
  );
}
