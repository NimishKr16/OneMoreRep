"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiChartBar,
  HiFire,
  HiSparkles,
  HiHome,
  HiHeart,
} from "react-icons/hi2";
import { HiInformationCircle } from "react-icons/hi";
import { GiMuscleUp, GiWeightScale } from "react-icons/gi";
import { IoClose } from "react-icons/io5";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: "Home", href: "/home", icon: HiHome },
  { name: "Workouts", href: "/workouts", icon: GiMuscleUp },
  { name: "Cardio", href: "/cardio", icon: HiHeart },
  { name: "Progress", href: "/progress", icon: HiChartBar },
  { name: "Body-Weight", href: "/bodyweight", icon: GiWeightScale },
  { name: "Ask Barbella", href: "/ai", icon: HiSparkles },
  { name: "Schedules", href: "/schedules", icon: HiFire },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-950 border-r border-gray-900 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-900">
            <h1 className="text-xl font-black text-white tracking-tight">
              1 MORE REP
            </h1>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-900">
            <div className="rounded-lg border border-cyan-900/30 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 p-4">
              <div className="flex items-center justify-center gap-2">
                <p className="text-xs text-cyan-400/90 text-center font-medium">
                  Keep pushing! 💪
                </p>
                <button
                  onClick={() => setIsInfoOpen(true)}
                  className="text-cyan-300/80 hover:text-cyan-200 transition-colors"
                  aria-label="App info"
                >
                  <HiInformationCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <button
            className="absolute inset-0"
            onClick={() => setIsInfoOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-950 p-5 shadow-2xl">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              About 1 MORE REP
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Built for clean, fast logging and a focused gym experience. Track
              workouts, bodyweight, and progress without the noise.
            </p>
            <p className="text-gray-400 text-sm mb-3">
              Made by a fellow gym-bro:{" "}
              <span className="text-white font-semibold">Nimish Kumar</span>
            </p>
            <p className="text-gray-400 text-sm">
              Email for support or suggestions:
              <br />
              <a
                href="mailto:nimishkumar.work@gmail.com"
                className="text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                nimishkumar.work@gmail.com
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
