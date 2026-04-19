"use client";

import { useMemo } from "react";
import Select, { SingleValue } from "react-select";

type SelectOption = {
  value: string;
  label: string;
};

interface PrebuiltSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  isLoading?: boolean;
  containerClassName?: string;
  inputId?: string;
}

export default function PrebuiltSelect({
  value,
  onChange,
  options,
  placeholder,
  isClearable = false,
  isSearchable = true,
  isLoading = false,
  containerClassName,
  inputId,
}: PrebuiltSelectProps) {
  const portalTarget =
    typeof document !== "undefined" ? document.body : undefined;

  const selectOptions = useMemo<SelectOption[]>(
    () => options.map((option) => ({ value: option, label: option })),
    [options],
  );

  const selected =
    selectOptions.find((option) => option.value === value) ?? null;

  return (
    <div className={containerClassName}>
      <Select
        inputId={inputId}
        value={selected}
        onChange={(selectedOption: SingleValue<SelectOption>) =>
          onChange(selectedOption?.value ?? "")
        }
        options={selectOptions}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isLoading={isLoading}
        menuPortalTarget={portalTarget}
        classNamePrefix="omr-select"
        unstyled
        classNames={{
          control: (state) =>
            `w-full rounded-lg border bg-black px-4 py-3 text-sm transition-colors ${
              state.isFocused ? "border-cyan-500" : "border-gray-800"
            }`,
          valueContainer: () => "p-0 gap-2",
          singleValue: () => "text-white",
          input: () => "!text-white",
          placeholder: () => "text-gray-500",
          indicatorsContainer: () => "gap-1",
          indicatorSeparator: () => "hidden",
          dropdownIndicator: () => "text-gray-500 hover:text-white",
          clearIndicator: () => "text-gray-500 hover:text-white",
          menu: () =>
            "mt-1 rounded-lg border border-gray-800 bg-gray-900 shadow-xl overflow-hidden z-50",
          menuList: () => "max-h-60 overflow-y-auto py-1",
          option: (state) =>
            `cursor-pointer px-4 py-3 text-sm transition-colors ${
              state.isSelected
                ? "bg-cyan-500/20 text-cyan-300"
                : state.isFocused
                  ? "bg-gray-800 text-white"
                  : "text-gray-300"
            }`,
          noOptionsMessage: () => "px-4 py-3 text-sm text-gray-500",
          loadingMessage: () => "px-4 py-3 text-sm text-gray-500",
        }}
      />
    </div>
  );
}
