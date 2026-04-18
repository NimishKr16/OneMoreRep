import WorkoutCard from "@/components/WorkoutCard";

interface HomeMostFrequentCardProps {
  mostFrequent: string[];
  isLoading: boolean;
  error: string;
  onClick: () => void;
}

export default function HomeMostFrequentCard({
  mostFrequent,
  isLoading,
  error,
  onClick,
}: HomeMostFrequentCardProps) {
  return (
    <WorkoutCard title="Most Frequent" onClick={onClick}>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex w-3 h-3 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
            <p className="text-gray-500 text-xs">Loading</p>
          </div>
        ) : error ? (
          <p className="text-gray-500 text-xs">Try again later</p>
        ) : mostFrequent.length > 0 ? (
          <>
            <p className="mb-1 line-clamp-2 text-base font-bold text-white">
              {mostFrequent.join(" • ")}
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-xs">No home workout types yet</p>
        )}
      </div>
    </WorkoutCard>
  );
}
