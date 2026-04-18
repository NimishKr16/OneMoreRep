"use client";

interface WorkoutActionsModalProps {
  isOpen: boolean;
  workoutType: string;
  isDeleting: boolean;
  error: string;
  onClose: () => void;
  onDelete: () => void;
}

export default function WorkoutActionsModal({
  isOpen,
  workoutType,
  isDeleting,
  error,
  onClose,
  onDelete,
}: WorkoutActionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-8 pt-24 sm:items-center sm:pb-4">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close actions"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-950 p-5 shadow-2xl">
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          Workout Actions
        </p>
        <p className="text-white text-sm mb-1">{workoutType}</p>
        <p className="text-gray-400 text-sm mb-4">
          Delete this workout from all screens and metrics.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-red-300 text-xs">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-red-500/40 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/30 transition-colors disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}
