"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  "Hammer Curl",
  "Tricep Pushdown",
  "Skull Crusher",
  "Dips",
  "Shoulder Press",
];

const WORKOUT_TYPES = [
  "Push",
  "Pull",
  "Legs",
  "Chest",
  "Back",
  "Arms",
  "Shoulders",
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

export default function LogWorkoutPage() {
  const router = useRouter();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [workoutType, setWorkoutType] = useState("Push");
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: crypto.randomUUID(),
      name: "",
      sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0 }],
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
      setExercises([
        {
          id: crypto.randomUUID(),
          name: "",
          sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0 }],
        },
      ]);
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
          date,
          workoutType,
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
      router.push("/home");
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save workout");
      setIsSaving(false);
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
            >
              {WORKOUT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
                    onChange={(name) => updateExerciseName(exercise.id, name)}
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
          className="w-full mb-6 py-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 text-white font-semibold text-base hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400/50 transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Add Exercise
        </button>

        {/* Save Button */}
        <button
          onClick={saveWorkout}
          disabled={isSaving || exercises.length === 0}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? "Saving..." : "Save Workout"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
