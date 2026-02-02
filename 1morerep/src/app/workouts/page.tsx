"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import WorkoutsList from "@/components/workouts/WorkoutsList";
import WorkoutTypeFilter from "@/components/workouts/WorkoutTypeFilter";
import BottomNav from "@/components/BottomNav";
import NewUserEmptyState from "@/components/home/NewUserEmptyState";
import { ActivityItem } from "@/types/activity";
import { HiMenuAlt2, HiPlus, HiUser } from "react-icons/hi";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function WorkoutsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workouts, setWorkouts] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [isTypesLoading, setIsTypesLoading] = useState(true);

  const fetchWorkoutTypes = useCallback(async () => {
    setIsTypesLoading(true);
    try {
      const response = await fetch("/api/workouts/types");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch workout types");
      }

      setWorkoutTypes(result?.data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to fetch workout types"));
    } finally {
      setIsTypesLoading(false);
    }
  }, []);

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const query = selectedType
        ? `?workout_type=${encodeURIComponent(selectedType)}`
        : "";
      const response = await fetch(`/api/workouts${query}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch workouts");
      }

      setWorkouts(result?.data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to fetch workouts"));
    } finally {
      setIsLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  useEffect(() => {
    fetchWorkoutTypes();
  }, [fetchWorkoutTypes]);

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
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Workouts
                </h1>
                <p className="text-gray-400 text-sm">
                  Your logged sessions and performance.
                </p>
              </div>
              <Link
                href="/log"
                className="flex items-center gap-2 rounded-xl px-4 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
              >
                <HiPlus className="w-5 h-5" />
                Add Workout
              </Link>
            </div>

            <div className="mb-6">
              <WorkoutTypeFilter
                options={workoutTypes}
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                onClear={() => setSelectedType("")}
                isLoading={isTypesLoading}
              />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <span className="inline-flex w-8 h-8 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading workouts</p>
              </div>
            ) : !error && workouts.length === 0 ? (
              <NewUserEmptyState
                eyebrow="Workouts"
                title="Log your first workout"
                motivationLine="Start with one session and build your momentum."
                description="One More Rep captures sets, volume, and PRs so progress stays clear."
                ctaLabel="Add your first workout"
                ctaHref="/log"
              />
            ) : (
              <WorkoutsList
                workouts={workouts}
                isLoading={isLoading}
                error={error}
                onRetry={fetchWorkouts}
              />
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
