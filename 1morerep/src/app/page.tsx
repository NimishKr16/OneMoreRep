import Link from "next/link";
import { HiArrowRight, HiChartBar, HiFire } from "react-icons/hi2";
import { TbInfinity } from "react-icons/tb";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <main className="w-full max-w-md text-center">
        <div className="space-y-12">
          {/* App Logo/Name */}
          <div className="space-y-4">
            <div className="relative">
              <h1 className="text-6xl font-black text-white tracking-tighter sm:text-7xl">
                1 MORE REP
              </h1>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
            </div>
            <p className="text-lg text-gray-400 font-light tracking-wide">
              PROGRESS, ONE REP AT A TIME
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 pt-4">
            <Link
              href="/login"
              className="group block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-500/50 transition-all hover:shadow-xl hover:shadow-cyan-500/60 hover:scale-[1.02] active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                GET STARTED
                <HiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            <Link
              href="/login"
              className="block w-full rounded-xl border-2 border-gray-800 bg-gray-900/50 backdrop-blur-sm px-8 py-4 text-lg font-bold text-gray-300 transition-all hover:border-gray-700 hover:bg-gray-800/50 hover:text-white hover:scale-[1.02] active:scale-95"
            >
              LOG IN
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-900">
            <div className="text-center">
              <TbInfinity className="text-3xl text-cyan-400 mx-auto" />
              <div className="text-xs text-gray-600 mt-1 font-medium">
                LIMITLESS
              </div>
            </div>
            <div className="text-center">
              <HiChartBar className="text-3xl text-cyan-400 mx-auto" />
              <div className="text-xs text-gray-600 mt-1 font-medium">
                ANALYTICS
              </div>
            </div>
            <div className="text-center">
              <HiFire className="text-3xl text-cyan-400 mx-auto" />
              <div className="text-xs text-gray-600 mt-1 font-medium">
                STREAKS
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
