"use client";

import PrebuiltSelect from "@/components/ui/PrebuiltSelect";

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
  return (
    <div className="relative">
      <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
        Filter by Workout Type
      </label>
      <PrebuiltSelect
        value={value}
        onChange={(nextValue) => {
          if (!nextValue) {
            onClear();
            return;
          }
          onChange(nextValue);
        }}
        options={options}
        placeholder={isLoading ? "Loading..." : "All"}
        isLoading={isLoading}
        isClearable
        isSearchable
      />
    </div>
  );
}
