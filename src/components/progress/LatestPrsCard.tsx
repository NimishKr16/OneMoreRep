"use client";

import { useEffect, useMemo, useState } from "react";
import { TbArrowUpRight } from "react-icons/tb";

interface PrEvent {
  exercise: string;
  value: number;
  date: string;
  reps: number;
  weight: number;
}

interface LatestPrsData {
  oneRmPr: PrEvent | null;
  fiveRmPr: PrEvent | null;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatDecimal = (value: number) => value.toFixed(1);

const formatWeight = (value: number) => formatDecimal(value);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function LatestPrsCard() {
  const [data, setData] = useState<LatestPrsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLatestPrs = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/progress/latest-prs");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch PRs");
        }

        setData(result?.data || null);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to fetch PRs"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPrs();
  }, []);

  const hasPrs = useMemo(() => {
    return Boolean(data?.oneRmPr || data?.fiveRmPr);
  }, [data?.fiveRmPr, data?.oneRmPr]);

  return (
    <section className="rounded-2xl border border-cyan-500/30 bg-linear-to-br from-gray-900 to-gray-950 p-5 shadow-lg shadow-cyan-500/20">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Latest PRs
        </p>
        <TbArrowUpRight className="text-cyan-300" />
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 py-4">
          <span className="inline-flex h-4 w-4 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
          <p className="text-xs text-gray-400">Loading PRs</p>
        </div>
      ) : !hasPrs ? (
        <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950/60 p-3 text-center">
          <p className="text-xs text-gray-400">No PRs yet</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-cyan-500/20 bg-gray-950/70 p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Latest 1RM PR
            </p>
            {data?.oneRmPr ? (
              <div className="mt-2 space-y-1">
                <p className="text-xl font-bold text-white">
                  {formatWeight(data.oneRmPr.value)}
                </p>
                <p className="text-xs text-gray-400">{data.oneRmPr.exercise}</p>
                <p className="text-[11px] text-gray-500">
                  {formatDate(data.oneRmPr.date)} • {data.oneRmPr.weight} x{" "}
                  {data.oneRmPr.reps}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">No 1RM PR yet</p>
            )}
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-gray-950/70 p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              Latest 5-Rep PR
            </p>
            {data?.fiveRmPr ? (
              <div className="mt-2 space-y-1">
                <p className="text-xl font-bold text-white">
                  {formatWeight(data.fiveRmPr.value)}
                </p>
                <p className="text-xs text-gray-400">
                  {data.fiveRmPr.exercise}
                </p>
                <p className="text-[11px] text-gray-500">
                  {formatDate(data.fiveRmPr.date)} • {data.fiveRmPr.weight} x{" "}
                  {data.fiveRmPr.reps}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400">No 5-rep PR yet</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
