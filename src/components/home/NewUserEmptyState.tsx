import Link from "next/link";
import { HiFire } from "react-icons/hi2";

interface NewUserEmptyStateProps {
  eyebrow?: string;
  title: string;
  motivationLine: string;
  description?: string;
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export default function NewUserEmptyState({
  eyebrow,
  title,
  motivationLine,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
}: NewUserEmptyStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-900/40 bg-gradient-to-br from-gray-950 via-cyan-950/30 to-blue-950/40 p-8 shadow-2xl shadow-cyan-500/10">
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300">
            <HiFire className="text-2xl" />
          </div>
          <div>
            {eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300/80">
                {eyebrow}
              </p>
            )}
            <h3
              className={`text-2xl font-black text-white ${eyebrow ? "mt-2" : ""}`}
            >
              {title}
            </h3>
            <p className="text-sm text-gray-400 mt-2 max-w-lg">
              {motivationLine}
            </p>
            {description && (
              <p className="text-sm text-gray-400 mt-2 max-w-lg">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center">
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold border border-cyan-300/60 shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:shadow-[0_0_30px_rgba(34,211,238,0.55)] transition-all"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold border border-cyan-300/60 shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:shadow-[0_0_30px_rgba(34,211,238,0.55)] transition-all"
            >
              {ctaLabel}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
