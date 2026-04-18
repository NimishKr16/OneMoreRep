"use client";

import { ReactNode } from "react";

interface WorkoutCardProps {
  title: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function WorkoutCard({
  title,
  children,
  onClick,
  className = "",
}: WorkoutCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-5 text-left transition-all group ${
        onClick
          ? "cursor-pointer hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
          : ""
      } ${className}`}
    >
      {/* Card Title */}
      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">
        {title}
      </div>

      {/* Card Content */}
      <div className="space-y-2">{children}</div>
    </div>
  );
}
