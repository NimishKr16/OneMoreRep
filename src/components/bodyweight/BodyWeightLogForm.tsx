"use client";

import { useState } from "react";
import WeightInput from "@/components/ui/WeightInput";

interface BodyWeightLogFormProps {
  /** Receives the weight already converted to kg for storage. */
  onSave: (weightKg: number, loggedAt: string) => Promise<void>;
  isSaving: boolean;
}

export default function BodyWeightLogForm({
  onSave,
  isSaving,
}: BodyWeightLogFormProps) {
  // Held in kg so flipping the unit pill converts the entry rather than
  // reinterpreting the digits in the new unit.
  const [weightKg, setWeightKg] = useState(0);
  const [loggedAt, setLoggedAt] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      setError("Enter a valid weight");
      return;
    }

    setError("");
    await onSave(weightKg, loggedAt);
    setWeightKg(0);
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 space-y-3">
      <p className="text-xs uppercase tracking-wider text-gray-500">
        Log Bodyweight
      </p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="grid grid-cols-1 gap-3">
        <WeightInput
          valueKg={weightKg}
          onChangeKg={setWeightKg}
          showUnitSuffix
          ariaLabel="Bodyweight"
          className="w-full px-4 py-3 pr-12 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
        />
        <input
          type="date"
          value={loggedAt}
          onChange={(e) => setLoggedAt(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
