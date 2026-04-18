"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BodyWeightChart, {
  BodyWeightPoint,
} from "@/components/bodyweight/BodyWeightChart";
import BodyWeightCurrentCard from "@/components/bodyweight/BodyWeightCurrentCard";
import BodyWeightHistory from "@/components/bodyweight/BodyWeightHistory";
import BodyWeightLogForm from "@/components/bodyweight/BodyWeightLogForm";
import BottomNav from "@/components/BottomNav";
import NewUserEmptyState from "@/components/home/NewUserEmptyState";
import { HiMenuAlt2, HiUser } from "react-icons/hi";
import { GiWeightScale } from "react-icons/gi";

interface BodyWeightLog {
  id: string;
  weight: number;
  logged_at: string;
  created_at: string;
}

export default function BodyWeightPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<BodyWeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bodyweight");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch bodyweight");
      }

      setLogs(result?.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bodyweight");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const latestLog = logs[0];

  const chartData = useMemo<BodyWeightPoint[]>(() => {
    return [...logs]
      .slice()
      .reverse()
      .map((log) => ({
        date: log.logged_at,
        weight: log.weight,
      }));
  }, [logs]);

  const historyItems = useMemo(() => logs.slice(0, 10), [logs]);

  const handleSave = async (weight: number, loggedAt: string) => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/bodyweight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight, logged_at: loggedAt }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to save bodyweight");
      }

      setShowForm(false);
      await fetchLogs();
    } catch (err: any) {
      setError(err.message || "Failed to save bodyweight");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-950 border-b border-gray-900 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <HiMenuAlt2 className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-2">
              <GiWeightScale className="w-5 h-5 text-cyan-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                Body Weight
              </h1>
            </div>
            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
            >
              <HiUser className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-3xl space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <span className="inline-flex w-8 h-8 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading bodyweight</p>
              </div>
            ) : (
              <>
                {logs.length === 0 ? (
                  showForm ? (
                    <BodyWeightLogForm
                      onSave={handleSave}
                      isSaving={isSaving}
                    />
                  ) : (
                    <NewUserEmptyState
                      eyebrow="Body Weight"
                      title="Log your first weigh-in"
                      motivationLine="A single entry starts your trend."
                      description="Track changes over time and stay consistent with your goals."
                      ctaLabel="Log bodyweight"
                      onCtaClick={() => setShowForm(true)}
                    />
                  )
                ) : (
                  <>
                    <BodyWeightCurrentCard
                      weight={latestLog?.weight ?? null}
                      loggedAt={latestLog?.logged_at ?? null}
                      isEmpty={logs.length === 0}
                    />

                    <BodyWeightChart data={chartData} />

                    {showForm ? (
                      <BodyWeightLogForm
                        onSave={handleSave}
                        isSaving={isSaving}
                      />
                    ) : (
                      <button
                        onClick={() => setShowForm(true)}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
                      >
                        + Log Bodyweight
                      </button>
                    )}

                    <BodyWeightHistory items={historyItems} />
                  </>
                )}
              </>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
