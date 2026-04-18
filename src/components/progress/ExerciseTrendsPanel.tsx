"use client";

import { useEffect, useMemo, useState } from "react";
import ExerciseAutocomplete from "@/components/ExerciseAutocomplete";
import ExerciseTrendChart, {
  ExerciseTrendPoint,
} from "@/components/progress/ExerciseTrendChart";

const formatCompact = (value: number) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const formatDecimal = (value: number) => value.toFixed(1);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function ExerciseTrendsPanel() {
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [trendData, setTrendData] = useState<ExerciseTrendPoint[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      setIsLoadingExercises(true);
      setError("");

      try {
        const response = await fetch("/api/home/strength-exercises");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch exercises");
        }

        const list = result?.data || [];
        setExercises(list);
        setSelectedExercise((prev) => prev || list[0] || "");
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to fetch exercises"));
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!selectedExercise) {
        setTrendData([]);
        return;
      }

      setIsLoadingTrends(true);
      setError("");

      try {
        const response = await fetch(
          `/api/progress/exercise-trends?exercise=${encodeURIComponent(
            selectedExercise,
          )}`,
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch trends");
        }

        setTrendData(result?.data || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to fetch trends"));
      } finally {
        setIsLoadingTrends(false);
      }
    };

    fetchTrends();
  }, [selectedExercise]);

  const hasExercises = exercises.length > 0;
  const isLoading = isLoadingExercises || isLoadingTrends;

  const headerSubtitle = useMemo(() => {
    if (isLoadingExercises) return "Loading exercises";
    if (!hasExercises) return "No exercises logged yet";
    return "Pick an exercise to see trends";
  }, [hasExercises, isLoadingExercises]);

  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Exercise trends
          </p>
          <h3 className="text-lg font-bold text-white">1RM and Volume</h3>
          <p className="text-xs text-gray-500">{headerSubtitle}</p>
        </div>
        <div className="w-full lg:w-64">
          <ExerciseAutocomplete
            value={selectedExercise}
            onChange={(value) => setSelectedExercise(value)}
            exercises={exercises}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!hasExercises && !isLoadingExercises ? (
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950/60 p-4 text-center">
          <p className="text-sm text-white font-semibold">
            Log an exercise to see trends
          </p>
          <p className="text-xs text-gray-400">
            Strength trends appear once you record workouts.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <span className="inline-flex h-6 w-6 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
          <p className="text-sm text-gray-400">Loading trends</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ExerciseTrendChart
            title="1 Rep Max trend"
            data={trendData}
            dataKey="oneRepMax"
            stroke="#38bdf8"
            valueFormatter={(value) => formatDecimal(value)}
          />
          <ExerciseTrendChart
            title="Volume trend"
            data={trendData}
            dataKey="volume"
            stroke="#22c55e"
            valueFormatter={(value) => formatCompact(value)}
          />
        </div>
      )}
    </section>
  );
}
