"use client";

import { useEffect, useRef, useState } from "react";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { toDisplayWeight, toStoredWeight } from "@/lib/units";

interface WeightInputProps {
  /** Canonical value in kg (0 / null means empty). */
  valueKg: number;
  /** Receives the new value already converted to kg. */
  onChangeKg: (weightKg: number) => void;
  className?: string;
  placeholder?: string;
  /** Show the unit as a suffix inside the field. */
  showUnitSuffix?: boolean;
  ariaLabel?: string;
}

/**
 * Weight field that displays and accepts the user's chosen unit while always
 * reporting kg upstream.
 *
 * Why the local `text` state: a purely derived `value` fights the user
 * mid-keystroke — typing "62." would round-trip through a number and snap back
 * to "62", eating the decimal point. So the raw text is held while the field is
 * being edited, and the canonical kg value is what gets reported out.
 *
 * On a unit switch we deliberately re-render the text from the kg value, so an
 * in-progress entry converts instead of being reinterpreted (225 lbs becomes
 * 102.06 kg — the same lift — not 225 kg).
 */
export default function WeightInput({
  valueKg,
  onChangeKg,
  className,
  placeholder,
  showUnitSuffix = false,
  ariaLabel,
}: WeightInputProps) {
  const { unit, unitLabel } = useWeightUnit();

  const format = (kg: number) =>
    kg ? String(Number(toDisplayWeight(kg, unit).toFixed(2))) : "";

  const [text, setText] = useState(() => format(valueKg));
  const isEditing = useRef(false);
  const prevUnit = useRef(unit);

  // Re-derive the text when the unit changes, or when the kg value changes from
  // outside (autofill from last workout, draft restore) while not being typed in.
  useEffect(() => {
    const unitChanged = prevUnit.current !== unit;
    prevUnit.current = unit;

    if (unitChanged || !isEditing.current) {
      setText(format(valueKg));
    }
    // format() closes over `unit`, which is in the dep list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, valueKg]);

  const handleChange = (raw: string) => {
    // Keep exactly what was typed so decimals and partial input survive.
    setText(raw);

    if (raw.trim() === "") {
      onChangeKg(0);
      return;
    }

    const entered = parseFloat(raw);
    if (Number.isFinite(entered) && entered >= 0) {
      onChangeKg(toStoredWeight(entered, unit));
    }
  };

  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        aria-label={ariaLabel ?? `Weight in ${unitLabel}`}
        placeholder={placeholder ?? `Weight (${unitLabel})`}
        value={text}
        onFocus={() => {
          isEditing.current = true;
        }}
        onBlur={() => {
          isEditing.current = false;
          // Normalise whatever was left in the box (e.g. "62." -> "62").
          setText(format(valueKg));
        }}
        onChange={(e) => handleChange(e.target.value)}
        className={className}
      />
      {showUnitSuffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
          {unitLabel}
        </span>
      )}
    </div>
  );
}
