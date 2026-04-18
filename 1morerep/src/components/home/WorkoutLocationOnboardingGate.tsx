interface WorkoutLocationOnboardingGateProps {
  selectedLocation: "home" | "gym" | null;
  isSaving: boolean;
  error: string;
  onSelect: (location: "home" | "gym") => void;
  onContinue: () => void;
}

export default function WorkoutLocationOnboardingGate({
  selectedLocation,
  isSaving,
  error,
  onSelect,
  onContinue,
}: WorkoutLocationOnboardingGateProps) {
  const optionBaseClass =
    "w-full rounded-2xl border px-4 py-4 text-left transition-all";

  return (
    <div className="min-h-screen bg-black px-4 py-10 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-2xl items-center justify-center">
        <div className="w-full rounded-3xl border border-cyan-900/40 bg-linear-to-br from-gray-950 via-cyan-950/30 to-blue-950/40 p-6 shadow-2xl shadow-cyan-500/10 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300/80">
            One More Rep Setup
          </p>
          <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">
            Where do you usually work out?
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Pick your primary workout location so we can personalize your
            dashboard.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            You can change this later from Profile.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onSelect("gym")}
              className={`${optionBaseClass} ${
                selectedLocation === "gym"
                  ? "border-cyan-400/80 bg-cyan-500/15"
                  : "border-gray-800 bg-gray-900/50 hover:border-cyan-500/40"
              }`}
              aria-pressed={selectedLocation === "gym"}
            >
              <p className="text-sm font-semibold text-white">Gym</p>
              <p className="mt-1 text-xs text-gray-400">
                Strength tracking, volume trends, and gym-focused metrics.
              </p>
            </button>
            <button
              type="button"
              onClick={() => onSelect("home")}
              className={`${optionBaseClass} ${
                selectedLocation === "home"
                  ? "border-cyan-400/80 bg-cyan-500/15"
                  : "border-gray-800 bg-gray-900/50 hover:border-cyan-500/40"
              }`}
              aria-pressed={selectedLocation === "home"}
            >
              <p className="text-sm font-semibold text-white">Home</p>
              <p className="mt-1 text-xs text-gray-400">
                Home workout frequency and most-used workout type insights.
              </p>
            </button>
          </div>

          {error && <p className="mt-4 text-xs text-rose-300">{error}</p>}

          <button
            type="button"
            onClick={onContinue}
            disabled={!selectedLocation || isSaving}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-cyan-300/50 bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving preference..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
