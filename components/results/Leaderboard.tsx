import Link from "next/link";
import { getLeaderboard } from "@/lib/results";
import { getAllTests } from "@/lib/tests";

type Board = NonNullable<ReturnType<typeof getLeaderboard>>;

const pct = (score: number, max: number) => (max ? Math.min(100, (100 * score) / max) : 0);

/** Slug -> display title, from the tests' own meta.mdx. */
function getTitles() {
  return Object.fromEntries(getAllTests().map((t) => [t.slug, t.title]));
}

/** View A: the headline chart. Models along the x-axis in rank order, total
 *  score up the y-axis, value on top of each bar. */
function VerticalBars({ board, titles }: { board: Board; titles: Record<string, string> }) {
  const max = board.models[0]?.max ?? 1;
  const step = 40;
  const ticks = Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step);
  const top = ticks[ticks.length - 1] < max ? max : ticks[ticks.length - 1];
  const at = (v: number) => `${(100 * v) / top}%`;

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-mist">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-glow)" }} />
          Top score
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-glow)", opacity: 0.6 }} />
          Other models
        </li>
        <li className="text-mist">Total across all {board.tests.length} tests, out of {max}</li>
      </ul>

      <div className="overflow-x-auto">
        <div className="min-w-[640px] pt-3">
          <div className="grid grid-cols-[auto_1fr] gap-x-2">
            {/* y-axis: title + tick labels */}
            <div className="relative flex w-9 justify-end">
              <span className="absolute left-0 top-1/2 origin-center -translate-x-3 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[10px] uppercase tracking-[0.15em] text-mist">
                Score
              </span>
              <div className="relative h-72 w-6">
                {ticks.map((t) => (
                  <span key={t} className="absolute right-0 translate-y-1/2 text-[10px] tabular-nums text-mist" style={{ bottom: at(t) }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* plot area */}
            <div className="relative h-72 border-b border-l border-line">
              {ticks.map((t) => (
                <span key={t} aria-hidden="true" className="absolute inset-x-0 border-t border-line/70" style={{ bottom: at(t) }} />
              ))}
              <ol className="absolute inset-0 flex items-end justify-around gap-2 px-2">
                {board.models.map((m, i) => (
                  <li key={m.slug} className="relative flex h-full min-w-0 flex-1 items-end justify-center" title={`${titles[m.slug] ?? m.slug}: ${m.total} / ${m.max}`}>
                    <div className="relative w-full max-w-14 rounded-t-sm" style={{ height: at(m.total), background: i === 0 ? "var(--color-glow)" : "color-mix(in oklab, var(--color-glow) 60%, transparent)" }}>
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs tabular-nums text-mist-bright">
                        {m.total.toFixed(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* x-axis: model names under their bars */}
            <span />
            <ol className="flex justify-around gap-2 px-2 pt-2">
              {board.models.map((m) => (
                <li key={m.slug} className="min-w-0 flex-1 text-center">
                  <Link href={`/tests/${m.slug}`} className="block text-[11px] leading-tight text-mist hover:text-mist-bright">
                    {titles[m.slug] ?? m.slug}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Step the accent down per test so stacked segments read as distinct bands. */
const SHADES = [1, 0.78, 0.6, 0.45, 0.32];

/** View A2: every model ranked by total, as one horizontal bar split into its
 *  tests. Segment width is points earned, so a bar's length is its total and
 *  each band shows where those points came from. */
function StackedBars({ board, titles }: { board: Board; titles: Record<string, string> }) {
  const max = board.models[0]?.max ?? 1;
  return (
    <div>
      <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-mist">
        {board.tests.map((t, i) => (
          <li key={t.id} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "var(--color-glow)", opacity: SHADES[i % SHADES.length] }} />
            {t.name}
          </li>
        ))}
      </ul>

      <ol className="relative space-y-3">
        {/* quarter gridlines behind the bars, aligned to the bar column */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[8.5rem] right-[4.5rem] sm:left-[13.5rem] sm:right-[5rem]">
          {[0, 25, 50, 75, 100].map((g) => (
            <span key={g} className="absolute inset-y-0 border-l border-line" style={{ left: `${g}%` }} />
          ))}
        </div>
        {board.models.map((m, i) => (
          <li key={m.slug} className="relative grid grid-cols-[1.25rem_7rem_1fr_4.5rem] items-center gap-x-3 text-sm sm:grid-cols-[1.5rem_11rem_1fr_5rem]">
            <span className="tabular-nums text-mist">{i + 1}</span>
            <Link href={`/tests/${m.slug}`} className="truncate text-mist-bright hover:text-glow">
              {titles[m.slug] ?? m.slug}
            </Link>
            <div className="flex h-6 gap-px">
              {board.tests.map((t, j) => {
                const v = m.tests[t.id] ?? 0;
                return (
                  <div
                    key={t.id}
                    className="h-full first:rounded-l-sm last:rounded-r-sm"
                    style={{ width: `${pct(v, max)}%`, background: "var(--color-glow)", opacity: SHADES[j % SHADES.length] }}
                    title={`${t.name}: ${v} / ${t.max}`}
                  />
                );
              })}
            </div>
            <span className="text-right tabular-nums text-mist-bright">
              {m.total.toFixed(1)}
              {!m.complete && <span className="ml-1 text-xs text-mist">partial</span>}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-2 flex justify-between pl-[8.5rem] pr-[4.5rem] text-[10px] tabular-nums text-mist sm:pl-[13.5rem] sm:pr-[5rem]">
        {[0, 25, 50, 75, 100].map((g) => (
          <span key={g}>{Math.round((max * g) / 100)}</span>
        ))}
      </div>
    </div>
  );
}

/** View B: one small ranked bar chart per test, so a model that is strong in one
 *  place and weak in another shows up where the totals hide it. */
function PerTest({ board, titles }: { board: Board; titles: Record<string, string> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {board.tests.map((t) => {
        const rows = board.models
          .filter((m) => m.tests[t.id] != null)
          .map((m) => ({ slug: m.slug, score: m.tests[t.id] }))
          .sort((a, b) => b.score - a.score);
        return (
          <div key={t.id} className="rounded-lg border border-line p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm text-mist-bright">{t.name}</h3>
              <span className="text-xs tabular-nums text-mist">out of {t.max}</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {rows.map((r, i) => (
                <li key={r.slug} className="grid grid-cols-[minmax(0,7.5rem)_1fr_2.75rem] items-center gap-x-2 text-xs">
                  <Link href={`/tests/${r.slug}`} className="truncate text-mist hover:text-mist-bright">
                    {titles[r.slug] ?? r.slug}
                  </Link>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct(r.score, t.max)}%`,
                        background: "var(--color-glow)",
                        opacity: i === 0 ? 1 : 0.6,
                      }}
                    />
                  </div>
                  <span className="text-right tabular-nums text-mist-bright">{r.score}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** View C: the exact numbers. */
function Table({ board, titles }: { board: Board; titles: Record<string, string> }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-mist">
            <th className="px-4 py-2.5 font-normal">#</th>
            <th className="px-2 py-2.5 font-normal">Model</th>
            {board.tests.map((t) => (
              <th key={t.id} className="px-2 py-2.5 text-right font-normal" title={`${t.name}, out of ${t.max}`}>
                {t.short}
              </th>
            ))}
            <th className="px-4 py-2.5 text-right font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {board.models.map((m, i) => (
            <tr key={m.slug} className="border-b border-line last:border-0">
              <td className="px-4 py-2 tabular-nums text-mist">{i + 1}</td>
              <td className="px-2 py-2">
                <Link href={`/tests/${m.slug}`} className="text-mist-bright hover:text-glow">
                  {titles[m.slug] ?? m.slug}
                </Link>
              </td>
              {board.tests.map((t) => (
                <td key={t.id} className="px-2 py-2 text-right tabular-nums text-mist">
                  {m.tests[t.id] ?? "–"}
                </td>
              ))}
              <td className="px-4 py-2 text-right tabular-nums text-mist-bright">
                {m.total}
                <span className="text-mist"> / {m.max}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg text-mist-bright">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-mist">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** The cross-model leaderboard: ranked totals, per-test bars, exact numbers. */
export default function Leaderboard() {
  const board = getLeaderboard();
  const titles = getTitles();
  if (!board || board.models.length === 0) return null;

  return (
    <>
      <Section title="Overall" note={`Total score out of ${board.models[0].max}, highest first.`}>
        <div className="rounded-lg border border-line p-4 sm:p-5">
          <VerticalBars board={board} titles={titles} />
        </div>
      </Section>
      <Section title="Where the points come from" note="Each bar is a model's total, split into its tests.">
        <div className="rounded-lg border border-line p-4 sm:p-5">
          <StackedBars board={board} titles={titles} />
        </div>
      </Section>
      <Section title="By test" note="Each test ranked on its own. Bars are scaled to that test's maximum.">
        <PerTest board={board} titles={titles} />
      </Section>
      <Section title="All scores">
        <Table board={board} titles={titles} />
      </Section>
    </>
  );
}
