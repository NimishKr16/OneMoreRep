/**
 * Unit conversion utilities.
 *
 * All weights are stored in KG in the database. Conversion happens only at the
 * display boundary (kg -> unit) and at the input boundary (unit -> kg).
 */

export type WeightUnit = "kg" | "lbs";

const KG_TO_LBS = 2.20462;

export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit,
): number {
  if (from === to) return value;
  if (from === "kg" && to === "lbs") return value * KG_TO_LBS;
  if (from === "lbs" && to === "kg") return value / KG_TO_LBS;
  return value;
}

/** Convert a stored (kg) value into the user's display unit. */
export function toDisplayWeight(valueKg: number, unit: WeightUnit): number {
  return convertWeight(valueKg, "kg", unit);
}

/** Convert a user-entered value in their unit back to kg for storage. */
export function toStoredWeight(value: number, unit: WeightUnit): number {
  return convertWeight(value, unit, "kg");
}

/**
 * Format a weight for display. Pounds read better without decimals since the
 * unit is finer-grained; kg keeps one decimal place.
 */
export function formatWeight(
  value: number,
  unit: WeightUnit,
  decimals?: number,
): string {
  const digits = decimals ?? (unit === "lbs" ? 0 : 1);
  return value.toFixed(digits);
}

/** Format a stored kg value straight into a display string, without the unit. */
export function formatStoredWeight(
  valueKg: number,
  unit: WeightUnit,
  decimals?: number,
): string {
  return formatWeight(toDisplayWeight(valueKg, unit), unit, decimals);
}

/** Large aggregate values (volume) read better rounded and grouped. */
export function formatVolume(valueKg: number, unit: WeightUnit): string {
  return Math.round(toDisplayWeight(valueKg, unit)).toLocaleString();
}

export function getWeightUnitLabel(unit: WeightUnit): string {
  return unit === "kg" ? "kg" : "lbs";
}
