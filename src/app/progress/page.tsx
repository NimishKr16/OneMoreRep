"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import StrengthIndexCard from "@/components/progress/StrengthIndexCard";
import ExerciseTrendsPanel from "@/components/progress/ExerciseTrendsPanel";
import LatestPrsCard from "@/components/progress/LatestPrsCard";
import BottomNav from "@/components/BottomNav";
import { HiMenuAlt2, HiUser } from "react-icons/hi";
import { HiChartBar } from "react-icons/hi2";

export default function ProgressPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
            >
              <HiUser className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <HiChartBar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Progress
                </h1>
                <p className="text-sm text-gray-400">
                  Strength trends and performance signals.
                </p>
              </div>
            </div>

            <StrengthIndexCard />

            <ExerciseTrendsPanel />

            <LatestPrsCard />

            <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-6 text-center">
              <p className="text-white font-semibold">
                More progress graphs soon
              </p>
              <p className="text-sm text-gray-400">
                Weekly volume, PR trends, and lift breakdowns will live here.
              </p>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
