"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import NotificationToggle from "@/components/notifications/NotificationToggle";
import { HiMenuAlt2, HiUser } from "react-icons/hi";
import { HiFire, HiBell } from "react-icons/hi2";

export default function SchedulesPage() {
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
        <main className="flex-1 p-4 max-w-xl mx-auto w-full space-y-8 pt-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Schedules
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your training preferences and reminders.
            </p>
          </div>

          {/* Notifications Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <HiBell className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Notifications
              </h2>
            </div>
            <NotificationToggle />
          </section>

          {/* Divider */}
          <div className="border-t border-gray-800" />

          {/* Coming Soon Section */}
          <section className="text-center py-8">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center">
                <HiFire className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <p className="text-base font-bold text-white mb-2">
              Smart Scheduling
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
              Build custom training programs, set rest days, and plan your week
              — coming soon.
            </p>
            <p className="mt-4 text-gray-600 text-xs uppercase tracking-wider font-semibold">
              Stay Tuned
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
