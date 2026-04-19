"use client";

import PrebuiltSelect from "@/components/ui/PrebuiltSelect";

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
  return (
    <PrebuiltSelect
      value={value}
      onChange={onChange}
      options={exercises}
      placeholder="Select exercise..."
      isSearchable
    />
  );
}
