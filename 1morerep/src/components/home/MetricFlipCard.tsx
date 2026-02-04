"use client";

import { ReactNode } from "react";
import { HiRefresh } from "react-icons/hi";

interface MetricFlipCardProps {
  titleFront: string;
  titleBack: string;
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
  onToggle: () => void;
  className?: string;
}

export default function MetricFlipCard({
  titleFront,
  titleBack,
  front,
  back,
  isFlipped,
  onToggle,
  className = "",
}: MetricFlipCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
      className={`relative rounded-xl border border-cyan-500/20 bg-linear-to-br from-gray-900 to-gray-950 p-5 text-left transition-all cursor-pointer hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 active:scale-[0.98] ${className}`}
    >
      <div className="absolute top-3 right-3 text-cyan-400/60 transition-colors">
        <HiRefresh
          className={`w-4 h-4 transition-transform duration-500 animate-pulse ${isFlipped ? "rotate-180" : ""}`}
        />
      </div>
      <div
        className={`relative transition-transform duration-500 transform-3d`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div style={{ backfaceVisibility: "hidden" }}>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
            {titleFront}
          </div>
          <div className="space-y-2">{front}</div>
        </div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider -mt-0.5">
            {titleBack}
          </div>
          <div className="mt-1">{back}</div>
        </div>
      </div>
    </div>
  );
}
