"use client";

import { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi";

interface ExerciseAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  exercises: string[];
}

export default function ExerciseAutocomplete({
  value,
  onChange,
  exercises,
}: ExerciseAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter exercises based on input
  const filteredExercises = exercises.filter((ex) =>
    ex.toLowerCase().includes(filter.toLowerCase()),
  );

  // Close dropdown when clicking outside
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

  const handleSelect = (exerciseName: string) => {
    onChange(exerciseName);
    setFilter("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={isOpen ? filter : value}
          onChange={(e) => {
            setFilter(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Select exercise..."
          className="w-full px-4 py-3 pr-10 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
        />
        <HiChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg bg-gray-900 border border-gray-800 shadow-xl">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <button
                key={exercise}
                onClick={() => handleSelect(exercise)}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0"
              >
                {exercise}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              No exercises found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
