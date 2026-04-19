"use client";

import PrebuiltSelect from "@/components/ui/PrebuiltSelect";

interface WorkoutTypeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function WorkoutTypeAutocomplete({
  value,
  onChange,
  options,
  placeholder = "Select workout type...",
}: WorkoutTypeAutocompleteProps) {
  return (
    <PrebuiltSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isSearchable
      containerClassName="w-full max-w-xs"
    />
  );
}
