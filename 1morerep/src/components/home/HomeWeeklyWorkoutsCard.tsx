import WorkoutCard from "@/components/WorkoutCard";

interface HomeWeeklyWorkoutsCardProps {
  weeklyWorkouts: number;
  isLoading: boolean;
  error: string;
  onClick: () => void;
}

export default function HomeWeeklyWorkoutsCard({
  weeklyWorkouts,
  isLoading,
  error,
  onClick,
}: HomeWeeklyWorkoutsCardProps) {
  return (
    <WorkoutCard title="This Week" onClick={onClick}>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex w-3 h-3 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
            <p className="text-gray-500 text-xs">Loading</p>
          </div>
        ) : error ? (
          <p className="text-gray-500 text-xs">Try again later</p>
        ) : (
          <>
            <p className="text-white font-bold text-xl mb-1">
              {weeklyWorkouts} workouts
            </p>
            <p className="text-gray-500 text-xs">Logged this week</p>
          </>
        )}
      </div>
    </WorkoutCard>
  );
}
