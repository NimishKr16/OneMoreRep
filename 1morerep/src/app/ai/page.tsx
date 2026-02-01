"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { HiMenuAlt2, HiUser } from "react-icons/hi";
import { HiSparkles } from "react-icons/hi2";

export default function AIPage() {
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
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
                <HiSparkles className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Coming Soon Text */}
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
              Ask Barbella
            </h1>
            <p className="text-xl text-cyan-400 font-bold mb-6">Coming Soon</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your AI-powered fitness coach is on the way! Get personalized
              workout advice, form tips, nutrition guidance, and answers to all
              your fitness questions.
            </p>

            {/* Decorative Element */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">
                Stay Tuned
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
