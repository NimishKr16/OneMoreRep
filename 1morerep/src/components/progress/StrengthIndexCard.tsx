"use client";

import { useEffect, useMemo, useState } from "react";
import { TbArrowDown, TbArrowUp, TbMinus } from "react-icons/tb";

interface StrengthIndexData {
  strengthIndex: number | null;
  changePct: number | null;
  weeksUsed: number;
  weeksWithData: number;
  windowStart: string | null;
  windowEnd: string | null;
  totalSets: number;
  totalE1rmVolume: number;
  topE1rm: number | null;
  hasIndex: boolean;
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const formatDecimal = (value: number, digits = 1) => value.toFixed(digits);

const formatDate = (value: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function StrengthIndexCard() {
  const [data, setData] = useState<StrengthIndexData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStrengthIndex = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/progress/strength-index?weeks=4");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Failed to fetch strength index");
        }

        setData(result?.data || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrengthIndex();
  }, []);

  const delta = data?.changePct ?? null;
  const deltaDisplay =
    delta === null ? "No prior window" : `${formatDecimal(delta)}%`;

  const deltaIcon = useMemo(() => {
    if (delta === null) return <TbMinus className="w-4 h-4" />;
    if (delta > 0) return <TbArrowUp className="w-4 h-4" />;
    if (delta < 0) return <TbArrowDown className="w-4 h-4" />;
    return <TbMinus className="w-4 h-4" />;
  }, [delta]);

  const deltaTone =
    delta === null
      ? "text-gray-400"
      : delta > 0
        ? "text-emerald-300"
        : delta < 0
          ? "text-rose-300"
          : "text-gray-400";

  const rangeLabel = useMemo(() => {
    if (!data?.windowStart || !data?.windowEnd) return "";
    return `${formatDate(data.windowStart)} - ${formatDate(data.windowEnd)}`;
  }, [data?.windowStart, data?.windowEnd]);

  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-linear-to-br from-gray-900 to-gray-950 p-4 shadow-lg shadow-cyan-500/10">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-gray-500">
          Strength Index
        </p>
        <p className="text-[10px] text-gray-500">{data?.weeksUsed ?? 4}w</p>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 py-3">
          <span className="inline-flex h-4 w-4 rounded-full border-2 border-gray-700 border-t-cyan-400 animate-spin" />
          <p className="text-xs text-gray-400">Loading</p>
        </div>
      ) : !data ? (
        <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950/60 p-3 text-center">
          <p className="text-xs text-gray-400">No strength data yet</p>
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">
              {data.hasIndex
                ? formatDecimal(data.strengthIndex ?? 0)
                : formatCompact(data.totalE1rmVolume)}
            </span>
            {data.hasIndex && (
              <span
                className={`flex items-center gap-1 text-[11px] ${deltaTone}`}
              >
                {deltaIcon}
                {deltaDisplay}
              </span>
            )}
          </div>

          <details className="mt-2 group">
            <summary className="cursor-pointer text-[11px] text-gray-500 hover:text-gray-300">
              Details
            </summary>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Total strength score
                </p>
                <p className="text-base font-semibold text-white">
                  {formatCompact(data.totalE1rmVolume)}
                </p>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Top estimated 1RM
                </p>
                <p className="text-base font-semibold text-white">
                  {data.topE1rm ? formatDecimal(data.topE1rm) : "--"}
                </p>
              </div>
              <div className="rounded-lg border border-gray-800 bg-gray-950/70 p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Sets logged
                </p>
                <p className="text-base font-semibold text-white">
                  {data.totalSets}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              {data.hasIndex
                ? `${rangeLabel} • ${data.weeksUsed} week${
                    data.weeksUsed === 1 ? "" : "s"
                  }`
                : "Not enough history for an index yet."}
            </p>
          </details>
        </div>
      )}
    </section>
  );
}
