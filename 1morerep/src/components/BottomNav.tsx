"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiPlus } from "react-icons/hi";
import { HiHome } from "react-icons/hi";
import { HiChartBar } from "react-icons/hi2";

export default function BottomNav() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/home";
  const isProgressActive = pathname.startsWith("/progress");

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-950 border-t border-gray-900 pb-safe">
      <div className="flex items-center px-4 py-3">
        <Link
          href="/home"
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
            isHomeActive ? "text-cyan-400" : "text-gray-400"
          }`}
        >
          <HiHome className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <Link
            href="/log"
            className="flex items-center justify-center w-14 h-14 -mt-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105"
            aria-label="Log workout"
          >
            <HiPlus className="w-7 h-7" />
          </Link>
        </div>

        <Link
          href="/progress"
          className={`flex-1 flex flex-col items-center gap-1 transition-colors ${
            isProgressActive ? "text-cyan-400" : "text-gray-400"
          }`}
        >
          <HiChartBar className="w-6 h-6" />
          <span className="text-xs font-medium">Progress</span>
        </Link>
      </div>
    </nav>
  );
}
