"use client";

import { useState } from "react";

interface BodyWeightLogFormProps {
  onSave: (weight: number, loggedAt: string) => Promise<void>;
  isSaving: boolean;
}

export default function BodyWeightLogForm({
  onSave,
  isSaving,
}: BodyWeightLogFormProps) {
  const [weight, setWeight] = useState("");
  const [loggedAt, setLoggedAt] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState("");

  const handleSave = async () => {
    const parsedWeight = parseFloat(weight);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setError("Enter a valid weight");
      return;
    }

    setError("");
    await onSave(parsedWeight, loggedAt);
    setWeight("");
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 space-y-3">
      <p className="text-xs uppercase tracking-wider text-gray-500">
        Log Bodyweight
      </p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="grid grid-cols-1 gap-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-black border border-gray-800 text-white focus:border-cyan-500 focus:outline-none"
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
