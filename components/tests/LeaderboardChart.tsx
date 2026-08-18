"use client";

import { createElement, useId } from "react";
import Link from "next/link";
import { getProviderIcon } from "@/components/icons";
import { formatPct } from "@/lib/scores";

export type LeaderboardBar = {
  slug: string;
  name: string;
  pct: number;
  provider: string | null;
};

const PLOT_H = 300;
const SLANT_THRESHOLD = 7;
const TICKS = [100, 75, 50, 25, 0] as const;

function GlobeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="16" cy="16" r="12" />
      <ellipse cx="16" cy="16" rx="5" ry="12" />
      <line x1="4" y1="16" x2="28" y2="16" />
      <path d="M6.5 9.5 h19 M6.5 22.5 h19" />
    </svg>
  );
}

function ModelLabel({
  row,
  slanted,
}: {
  row: LeaderboardBar;
  slanted: boolean;
}) {
  const icon = getProviderIcon(row.provider);
  return (
    <div className="flex min-w-0 flex-col items-center pt-2.5">
      {icon
        ? createElement(icon, {
            width: 16,
            height: 16,
            className: "shrink-0 text-mist-bright",
            "aria-hidden": true,
          })
        : (
          <span className="h-4 w-4" aria-hidden />
        )}
      {slanted ? (
        <span className="relative mt-2 h-[5.5rem] w-full">
          <span className="absolute top-0 left-1/2 origin-top-left rotate-[40deg] whitespace-nowrap font-display text-[11px] text-mist-bright">
            {row.name}
          </span>
        </span>
      ) : (
        <span className="mt-1.5 max-w-full px-1 text-center font-display text-[11px] leading-tight text-mist-bright">
          {row.name}
        </span>
      )}
    </div>
  );
}

export default function LeaderboardChart({ rows }: { rows: LeaderboardBar[] }) {
  const gid = useId();
  if (rows.length === 0) return null;

  const slanted = rows.length >= SLANT_THRESHOLD;

  return (
    <figure className="mt-8 border border-line">
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-mist">
          Overall ladder score
        </p>
        <div className="flex items-center gap-2 text-mist" aria-hidden>
          <GlobeMark className="h-3.5 w-3.5" />
          <span className="font-display text-[10px] uppercase tracking-[0.2em]">
            worldbench
          </span>
        </div>
      </figcaption>

      <div className="overflow-x-auto p-4 pb-2">
        <div
          className="min-w-0 pr-10"
          style={{ minWidth: `${Math.max(rows.length * 3.4, 28)}rem` }}
        >
          <div className="flex gap-2">
            <div className="relative w-8 shrink-0" style={{ height: PLOT_H }}>
              {TICKS.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 font-display text-[10px] tabular-nums leading-none text-mist"
                  style={{
                    top: `${100 - tick}%`,
                    transform: "translateY(-50%)",
                  }}
                >
                  {tick}
                </span>
              ))}
            </div>

            <div
              className="relative min-w-0 flex-1 border border-line bg-void-deep"
              style={{ height: PLOT_H }}
              role="img"
              aria-labelledby={`${gid}-title`}
            >
              <p id={`${gid}-title`} className="sr-only">
                Overall ladder score for each model, from 0 to 100.
              </p>

              {[25, 50, 75].map((tick) => (
                <div
                  key={tick}
                  aria-hidden
                  className="pointer-events-none absolute right-0 left-0 h-px"
                  style={{
                    bottom: `${tick}%`,
                    backgroundImage:
                      "repeating-linear-gradient(to right, color-mix(in oklab, var(--color-mist) 32%, transparent) 0 2px, transparent 2px 7px)",
                  }}
                />
              ))}

              <div className="absolute inset-0 flex items-end">
                {rows.map((row) => {
                  const height = Math.max(row.pct * 100, row.pct > 0 ? 0.8 : 0);
                  return (
                    <Link
                      key={row.slug}
                      href={`/tests/${row.slug}`}
                      className="group relative flex h-full min-w-0 flex-1 items-end justify-center focus:outline-none focus-visible:bg-line/40"
                      aria-label={`${row.name}, ${formatPct(row.pct)}`}
                    >
                      <span className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2 font-display text-[10px] tabular-nums tracking-[0.08em] text-mist opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {formatPct(row.pct)}
                      </span>
                      <span
                        className="w-[38%] max-w-9 min-w-[9px] bg-mist-bright/80 transition-colors duration-150 group-hover:bg-mist-bright group-focus-visible:bg-mist-bright"
                        style={{ height: `${height}%` }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-0 flex gap-2">
            <div className="w-8 shrink-0" aria-hidden />
            <div className="flex min-w-0 flex-1">
              {rows.map((row) => (
                <div key={row.slug} className="min-w-0 flex-1">
                  <ModelLabel row={row} slanted={slanted} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
