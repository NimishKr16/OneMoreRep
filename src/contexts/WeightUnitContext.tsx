"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { WeightUnit, getWeightUnitLabel } from "@/lib/units";
import { createClient } from "@/lib/supabase/client";

interface WeightUnitContextType {
  unit: WeightUnit;
  /** "kg" | "lbs", ready to render next to a number. */
  unitLabel: string;
  setUnit: (unit: WeightUnit) => void;
  isLoading: boolean;
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(
  undefined,
);

const WEIGHT_UNIT_STORAGE_KEY = "omr:weightUnit";

const isWeightUnit = (value: unknown): value is WeightUnit =>
  value === "kg" || value === "lbs";

export function WeightUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>("kg");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  // Hydrate from localStorage first (instant, no flash), then reconcile with
  // the server-side preference so the choice follows the user across devices.
  useEffect(() => {
    let cancelled = false;

    const stored = window.localStorage.getItem(WEIGHT_UNIT_STORAGE_KEY);
    if (isWeightUnit(stored)) {
      setUnitState(stored);
    }

    const syncFromServer = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (cancelled || error) return;

        const remote = data.user?.user_metadata?.weight_unit;
        if (isWeightUnit(remote)) {
          setUnitState(remote);
          window.localStorage.setItem(WEIGHT_UNIT_STORAGE_KEY, remote);
        }
      } catch {
        // Offline or unauthenticated: the localStorage value stands.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    syncFromServer();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const setUnit = useCallback(
    (newUnit: WeightUnit) => {
      setUnitState(newUnit);
      window.localStorage.setItem(WEIGHT_UNIT_STORAGE_KEY, newUnit);

      // Fire-and-forget: the local value is already authoritative for the UI.
      void supabase.auth
        .updateUser({ data: { weight_unit: newUnit } })
        .catch(() => {
          // Preference stays local if the sync fails.
        });
    },
    [supabase],
  );

  const value = useMemo(
    () => ({
      unit,
      unitLabel: getWeightUnitLabel(unit),
      setUnit,
      isLoading,
    }),
    [unit, setUnit, isLoading],
  );

  return (
    <WeightUnitContext.Provider value={value}>
      {children}
    </WeightUnitContext.Provider>
  );
}

export function useWeightUnit() {
  const context = useContext(WeightUnitContext);
  if (context === undefined) {
    throw new Error("useWeightUnit must be used within WeightUnitProvider");
  }
  return context;
}
