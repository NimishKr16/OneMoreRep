"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HiChevronDown, HiX } from "react-icons/hi";

interface WorkoutTypeFilterProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading: boolean;
}

export default function WorkoutTypeFilter({
  options,
  value,
  onChange,
  onClear,
  isLoading,
}: WorkoutTypeFilterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
        Filter by Workout Type
      </label>
      <div className="relative">
        <input
          type="text"
          value={value || query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            if (value) onClear();
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isLoading ? "Loading..." : "All"}
          className="w-full px-4 py-3 pr-20 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
        />
        {value ? (
          <button
            onClick={() => {
              onClear();
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear filter"
          >
            <HiX className="w-5 h-5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
          aria-label={isOpen ? "Close filter" : "Open filter"}
        >
          <HiChevronDown
            className={`w-5 h-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-40 mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 shadow-xl max-h-56 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No workout types found
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  setQuery("");
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  option === value
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {option}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
