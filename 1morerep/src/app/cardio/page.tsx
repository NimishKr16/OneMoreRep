"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import NewUserEmptyState from "@/components/home/NewUserEmptyState";
import CardioLogCard from "@/components/cardio/CardioLogCard";
import { CardioLogSummary } from "@/types/activity";
import { HiMenuAlt2, HiPlus, HiUser } from "react-icons/hi";
import { HiHeart } from "react-icons/hi2";

export default function CardioPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cardioLogs, setCardioLogs] = useState<CardioLogSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCardio = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/cardio");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch cardio");
        }

        setCardioLogs(result?.data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch cardio");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardio();
  }, []);

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-gray-950 border-b border-gray-900 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <HiMenuAlt2 className="w-7 h-7" />
            </button>
            <div className="flex items-center gap-2">
              <HiHeart className="w-5 h-5 text-cyan-400" />
              <h1 className="text-2xl font-black text-white tracking-tight">
                Cardio
              </h1>
            </div>
            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
            >
              <HiUser className="w-5 h-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  Cardio
                </h2>
                <p className="text-gray-400 text-sm">
                  Track runs, rides, walks, and more.
                </p>
              </div>
              <button
                onClick={() => router.push("/log?mode=cardio")}
                className="flex items-center gap-2 rounded-xl px-4 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
              >
                <HiPlus className="w-5 h-5" />
                Add Cardio
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <span className="inline-flex w-8 h-8 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
                <p className="text-gray-400 text-sm">Loading cardio</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : cardioLogs.length === 0 ? (
              <NewUserEmptyState
                eyebrow="Cardio"
                title="Log your first cardio"
                motivationLine="A quick session keeps your streak alive."
                description="Capture distance, time, and effort in seconds."
                ctaLabel="Log cardio"
                ctaHref="/log?mode=cardio"
              />
            ) : (
              <div className="space-y-3">
                {cardioLogs.map((log) => (
                  <CardioLogCard key={log.id} cardio={log} />
                ))}
              </div>
            )}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
