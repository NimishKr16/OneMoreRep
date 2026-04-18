"use client";

import { useEffect, useRef, useState } from "react";
import { FaFire } from "react-icons/fa";

interface StreakBadgeProps {
  count: number | null;
  isLoading: boolean;
}

export default function StreakBadge({ count, isLoading }: StreakBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => setIsOpen(false), 3000);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const message = isLoading
    ? "Loading streak"
    : count && count > 0
      ? "Momentum looks strong."
      : "Start today and build it.";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-cyan-300"
        aria-label="Streak details"
      >
        <FaFire className="text-lg" />
        <span className="text-2xl font-black">
          {isLoading ? "–" : (count ?? 0)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-cyan-900/40 bg-gray-950 px-3 py-2 text-xs text-cyan-100 shadow-lg z-40">
          {message}
        </div>
      )}
    </div>
  );
}
