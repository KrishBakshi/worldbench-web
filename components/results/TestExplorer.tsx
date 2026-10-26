"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ChartHover from "@/components/results/ChartHover";
import { tip, type TipRow } from "@/components/results/tip";
import { testColor } from "@/components/results/series";

/** The part of a test a chart can rank on: the test as a whole, or one biome. */
export interface ExplorerSub {
  id: string;
  label: string;
  max: number;
  /** slug -> score; a model missing from it wasn't scored here. */
  scores: Record<string, number>;
}

export interface ExplorerTest {
  id: string;
  name: string;
  max: number;
  /** This test's share of the full total, as a whole percent. */
  weight: number;
  /** `subs[0]` is always the whole test; the rest, when there are any, are biomes. */
  subs: ExplorerSub[];
}

export interface ExplorerModel {
  slug: string;
  title: string;
  total: number;
  max: number;
  /** test id -> score; a test that wasn't run is missing. */
  tests: Record<string, number>;
}

const LEAD = "var(--color-glow)";
const REST = "var(--color-data-mid)";
const ALL = "all";
const EASE = [0.16, 1, 0.3, 1] as const;
const COLS = "grid-cols-[1.5rem_minmax(0,8rem)_1fr_2.75rem] sm:grid-cols-[1.75rem_minmax(0,12rem)_1fr_3.5rem]";

const share = (score: number, max: number) => (max ? Math.min(100, (100 * score) / max) : 0);

/** Whole points stay whole; anything fractional shows one place throughout, so
 *  a view never mixes "40" and "37.3". */
function formatFor(scores: number[]) {
  const dp = scores.some((v) => !Number.isInteger(v)) ? 1 : 0;
  return (n: number) => n.toFixed(dp);
}

/** Leader line for a card: the top scorer, plus how many share the top. */
function leaderLine(scores: Record<string, number>, titles: Record<string, string>) {
  const rows = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (!rows.length) return null;
  const tied = rows.filter(([, v]) => v === rows[0][1]);
  const name = titles[tied[0][0]] ?? tied[0][0];
  return { name: tied.length > 1 ? `${name} +${tied.length - 1}` : name, score: rows[0][1] };
}

function Card({
  on,
  title,
  meta,
  lead,
  onClick,
}: {
  on: boolean;
  title: string;
  meta: string;
  lead: { name: string; score: string } | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      aria-controls="test-explorer-panel"
      onClick={onClick}
      className={`flex cursor-pointer flex-col rounded-lg border p-3 text-left transition-colors ${
        on ? "border-glow/70 bg-glow/[0.06]" : "border-line hover:border-mist/60"
      }`}
    >
      <span className="font-display text-sm leading-tight text-mist-bright">{title}</span>
      <span className="mt-0.5 text-[11px] tabular-nums text-mist">{meta}</span>
      {lead && (
        <span className="mt-auto flex items-baseline justify-between gap-2 pt-3 text-[11px]">
          <span className="truncate text-mist">{lead.name}</span>
          <span className={`shrink-0 tabular-nums ${on ? "text-glow" : "text-mist-bright"}`}>{lead.score}</span>
        </span>
      )}
    </button>
  );
}

/**
 * "By test" on the leaderboard: cards over one ranked bar chart.
 *
 * - **All tests** (the default) stacks each model's total from its tests, in
 *   the blue ramp, so the bars show both the ranking and where each model's
 *   points came from. Pointing at a band or a legend key lights that test
 *   across every bar.
 * - **A test card** keeps only that test's band, re-scaled to the test's
 *   maximum and re-ranked; the leader is the one bar in the accent.
 * - **A biome** (micro-contents and physics are scored per biome) re-ranks
 *   the same bars on that biome alone, out of 10.
 *
 * Every bar is always the same stack of test bands, and a view only changes
 * their widths, so switching reads as the chart moving rather than being
 * redrawn: bands ease to their new length and rows slide to their new rank.
 */
export default function TestExplorer({
  tests,
  models,
}: {
  tests: ExplorerTest[];
  models: ExplorerModel[];
}) {
  const [testId, setTestId] = useState(ALL);
  const [subId, setSubId] = useState(ALL);
  const reduce = useReducedMotion();

  const titles = Object.fromEntries(models.map((m) => [m.slug, m.title]));
  const test = tests.find((t) => t.id === testId);
  const sub = test ? (test.subs.find((s) => s.id === subId) ?? test.subs[0]) : null;
  const scale = sub ? sub.max : (models[0]?.max ?? 1);

  // The value each bar is ranked and labelled by in this view.
  const valueOf = (m: ExplorerModel) => (sub ? sub.scores[m.slug] : m.total);
  const rows = models
    .filter((m) => valueOf(m) != null)
    .sort((a, b) => valueOf(b) - valueOf(a))
    .map((m, _, all) => ({ m, rank: all.findIndex((x) => valueOf(x) === valueOf(m)) + 1 }));
  const best = rows[0] ? valueOf(rows[0].m) : 0;
  const f = formatFor(rows.map((r) => valueOf(r.m)));

  function pickTest(id: string) {
    setTestId(id);
    setSubId(ALL);
  }

  const allLead = leaderLine(Object.fromEntries(models.map((m) => [m.slug, m.total])), titles);

  return (
    <div>
      <div role="tablist" aria-label="Tests" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card
          on={!test}
          title="All tests"
          meta={`out of ${models[0]?.max ?? 0} · ${tests.length} tests`}
          lead={allLead && { name: allLead.name, score: allLead.score.toFixed(1) }}
          onClick={() => pickTest(ALL)}
        />
        {tests.map((t) => {
          const lead = leaderLine(t.subs[0].scores, titles);
          return (
            <Card
              key={t.id}
              on={t.id === test?.id}
              title={t.name}
              meta={`out of ${t.max} · ${t.weight}% of total`}
              lead={lead && { name: lead.name, score: formatFor(Object.values(t.subs[0].scores))(lead.score) }}
              onClick={() => pickTest(t.id)}
            />
          );
        })}
      </div>

      <div id="test-explorer-panel" role="tabpanel" className="mt-3 rounded-lg border border-line p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="text-sm text-mist-bright">
            {test ? test.name : "Where the points come from"}
            {sub && sub.id !== ALL && <span className="text-mist"> · {sub.label}</span>}
          </h3>
          <span className="text-xs tabular-nums text-mist">
            {!test
              ? `Each total split into its tests, out of ${scale}`
              : sub?.id === ALL
                ? `Bars run to the test's maximum, ${scale}`
                : `${sub?.label} only, out of ${scale}`}
          </span>
        </div>

        {test && test.subs.length > 1 && (
          <div role="tablist" aria-label={`${test.name} by biome`} className="mt-3 flex flex-wrap gap-1.5">
            {test.subs.map((s) => {
              const on = s.id === sub?.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setSubId(s.id)}
                  className={`cursor-pointer rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                    on
                      ? "border-glow/70 bg-glow/10 text-mist-bright"
                      : "border-line text-mist hover:border-mist/60 hover:text-mist-bright"
                  }`}
                >
                  {s.id === ALL ? "Overall" : s.label}
                </button>
              );
            })}
          </div>
        )}

        <ChartHover className="mt-4">
          <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-mist">
            {test ? (
              <>
                <li className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: LEAD }} />
                  Top score {sub?.id === ALL ? "in this test" : "in this biome"}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: REST }} />
                  Other models
                </li>
              </>
            ) : (
              tests.map((t) => (
                <li key={t.id} className="flex items-center gap-1.5" {...tip({ key: t.id })}>
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: testColor(t.id) }} />
                  {t.name} ({t.max})
                </li>
              ))
            )}
          </ul>

          <ol className="space-y-2">
            {rows.map(({ m, rank }) => {
              const value = valueOf(m);
              const isBest = value === best;
              const tipRows: TipRow[] = [
                [sub?.id === ALL ? (test?.name ?? "") : `${test?.name}, ${sub?.label}`, `${f(value)} / ${scale}`],
                ["Share", `${share(value, scale).toFixed(1)}%`],
                ["Rank", `#${rank} of ${rows.length}`],
              ];
              return (
                <motion.li
                  key={m.slug}
                  layout={!reduce}
                  transition={{ duration: 0.4, ease: EASE }}
                  className={`grid items-center gap-x-3 text-xs ${COLS}`}
                >
                  <span className="tabular-nums text-mist">{rank}</span>
                  <Link href={`/tests/${m.slug}`} className="truncate text-mist hover:text-mist-bright">
                    {m.title}
                  </Link>
                  {/* The stack: one band per test, heaviest first. In a
                      single-test view every band but that one is 0 wide. */}
                  <div className="relative h-3">
                    {[25, 50, 75].map((g) => (
                      <span key={g} aria-hidden="true" className="absolute inset-y-[-4px] border-l border-line/60" style={{ left: `${g}%` }} />
                    ))}
                    <div
                      className={`relative flex h-full ${test ? "" : "gap-0.5"}`}
                      {...(test ? tip({ title: m.title, key: m.slug, rows: tipRows }) : {})}
                    >
                      {tests.map((t) => {
                        const v = m.tests[t.id] ?? 0;
                        const w = !test ? share(v, scale) : t.id === test.id ? share(value, scale) : 0;
                        return (
                          <div
                            key={t.id}
                            className="h-full shrink-0 transition-[width,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] last:rounded-r-sm motion-reduce:transition-none"
                            style={{ width: `${w}%`, background: !test ? testColor(t.id) : isBest ? LEAD : REST }}
                            {...(!test
                              ? tip({
                                  title: m.title,
                                  key: t.id,
                                  rows: [
                                    [t.name, `${formatFor([v])(v)} / ${t.max}`, testColor(t.id)],
                                    ["Of this model's total", `${share(v, m.total).toFixed(0)}%`],
                                    ["Model total", `${m.total.toFixed(1)} / ${m.max}`],
                                  ],
                                })
                              : {})}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-right tabular-nums text-mist-bright">{f(value)}</span>
                </motion.li>
              );
            })}
          </ol>
          <div className={`mt-2 grid gap-x-3 text-[10px] tabular-nums text-mist ${COLS}`}>
            <span />
            <span />
            <div className="relative h-3">
              {[0, 25, 50, 75, 100].map((g) => (
                <span key={g} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${g}%` }}>
                  {Math.round((scale * g) / 100)}
                </span>
              ))}
            </div>
            <span />
          </div>
        </ChartHover>
      </div>
    </div>
  );
}
