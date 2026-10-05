import { createElement } from "react";
import Link from "next/link";
import { getLeaderboard } from "@/lib/results";
import { getAllTests } from "@/lib/tests";
import { getProvider } from "@/lib/providers";
import { getProviderIcon } from "@/components/icons";

type Board = NonNullable<ReturnType<typeof getLeaderboard>>;
type Test = Board["tests"][number];
type Model = Board["models"][number];

interface Info {
  title: string;
  provider: string | null;
}

const share = (score: number, max: number) => (max ? Math.min(100, (100 * score) / max) : 0);
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

/** The leader's fill, and the step back every other bar takes from it. */
const LEAD = "var(--color-glow)";
const REST = "color-mix(in oklab, var(--color-glow) 55%, transparent)";

/** Slug -> title and provider, from the tests' own meta.mdx. */
function getInfo(): Record<string, Info> {
  return Object.fromEntries(getAllTests().map((t) => [t.slug, { title: t.title, provider: t.provider }]));
}

/** Tests heaviest first: the ones that move the total most are read first. A
 *  stable sort, so equal weights keep the harness's own order. */
function byWeight(tests: Test[]) {
  return [...tests].sort((a, b) => b.max - a.max);
}

/** Per test, the top score and the models that reached it (ties share it). */
function getLeaders(board: Board) {
  return Object.fromEntries(
    board.tests.map((t) => {
      const scores = board.models.map((m) => m.tests[t.id]).filter((v): v is number => v != null);
      const best = Math.max(...scores);
      return [t.id, { best, slugs: board.models.filter((m) => m.tests[t.id] === best).map((m) => m.slug) }];
    }),
  );
}

function ModelMark({ provider, className }: { provider: string | null; className: string }) {
  const icon = getProviderIcon(provider);
  return icon ? createElement(icon, { className, "aria-hidden": true }) : <span className={className} />;
}

/** 1. The top three, as the page's headline numbers. */
function Podium({ board, info }: { board: Board; info: Record<string, Info> }) {
  return (
    <ol className="mt-8 grid gap-3 sm:grid-cols-3">
      {board.models.slice(0, 3).map((m, i) => {
        const { title, provider } = info[m.slug] ?? { title: m.slug, provider: null };
        return (
          <li key={m.slug}>
            <Link
              href={`/tests/${m.slug}`}
              className={`group flex h-full flex-col rounded-lg border p-4 transition-colors hover:border-mist ${
                i === 0 ? "border-glow/60" : "border-line"
              }`}
            >
              <div className="flex items-center justify-between text-xs text-mist">
                <span className="tabular-nums">#{i + 1}</span>
                <ModelMark provider={provider} className="h-4 w-4 text-mist" />
              </div>
              <span className="mt-3 font-display text-base leading-tight text-mist-bright group-hover:text-glow">{title}</span>
              <span className="text-xs text-mist">{getProvider(provider)?.name ?? ""}</span>
              <span className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-3xl tabular-nums text-mist-bright">{share(m.total, m.max).toFixed(1)}%</span>
                <span className="text-xs tabular-nums text-mist">
                  {fmt(m.total)} / {m.max} pts
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** 2. Every model ranked by total. Bars start at zero and run to the full
 *  280, so lengths compare honestly; the leader is the one bar at full accent. */
function Rankings({
  board,
  info,
  leaders,
}: {
  board: Board;
  info: Record<string, Info>;
  leaders: ReturnType<typeof getLeaders>;
}) {
  const tests = byWeight(board.tests);
  const cols = "grid-cols-[1.5rem_minmax(0,9rem)_1fr_3.5rem] sm:grid-cols-[1.75rem_minmax(0,13rem)_1fr_5.5rem]";
  return (
    <div className="rounded-lg border border-line p-4 sm:p-5">
      <ol className="space-y-2.5">
        {board.models.map((m, i) => {
          const { title, provider } = info[m.slug] ?? { title: m.slug, provider: null };
          const tops = tests.filter((t) => leaders[t.id]?.slugs.includes(m.slug)).map((t) => t.short);
          return (
            <li key={m.slug} className={`grid items-center gap-x-3 text-sm ${cols}`}>
              <span className="tabular-nums text-mist">{i + 1}</span>
              <Link href={`/tests/${m.slug}`} className="group flex min-w-0 items-center gap-2">
                <ModelMark provider={provider} className="hidden h-3.5 w-3.5 shrink-0 text-mist sm:block" />
                <span className="min-w-0">
                  <span className="block truncate text-mist-bright group-hover:text-glow">{title}</span>
                  {tops.length > 0 && (
                    <span className="block truncate text-[10px] text-mist" title={`Top score in ${tops.join(", ")}`}>
                      {tops.length > 2 ? `Top score in ${tops.length} of ${tests.length} tests` : `Top in ${tops.join(", ")}`}
                    </span>
                  )}
                </span>
              </Link>
              <div className="relative h-5" title={`${title}: ${fmt(m.total)} / ${m.max}`}>
                {[25, 50, 75].map((g) => (
                  <span key={g} aria-hidden="true" className="absolute inset-y-[-5px] border-l border-line/60" style={{ left: `${g}%` }} />
                ))}
                <div className="relative h-full rounded-r" style={{ width: `${share(m.total, m.max)}%`, background: i === 0 ? LEAD : REST }} />
              </div>
              <span className="text-right tabular-nums">
                <span className="text-mist-bright">{share(m.total, m.max).toFixed(1)}%</span>
                <span className="hidden text-xs text-mist sm:inline"> · {fmt(m.total)}</span>
                {!m.complete && <span className="block text-[10px] text-mist">partial</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <div className={`mt-2 grid gap-x-3 text-[10px] tabular-nums text-mist ${cols}`}>
        <span />
        <span />
        <div className="relative h-3">
          {[0, 25, 50, 75, 100].map((g) => (
            <span key={g} className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full" style={{ left: `${g}%` }}>
              {g}%
            </span>
          ))}
        </div>
        <span />
      </div>
    </div>
  );
}

/** 3. One small ranked chart per test, heaviest first, so a model that is
 *  strong in one place and weaker in another shows up where totals hide it. */
function PerTest({
  board,
  info,
  leaders,
}: {
  board: Board;
  info: Record<string, Info>;
  leaders: ReturnType<typeof getLeaders>;
}) {
  const total = board.tests.reduce((s, t) => s + t.max, 0);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {byWeight(board.tests).map((t) => {
        const rows = board.models
          .filter((m) => m.tests[t.id] != null)
          .map((m) => ({ slug: m.slug, score: m.tests[t.id] }))
          .sort((a, b) => b.score - a.score);
        const best = leaders[t.id]?.best;
        return (
          <div key={t.id} className="rounded-lg border border-line p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-sm text-mist-bright">{t.name}</h3>
              <span className="shrink-0 text-xs tabular-nums text-mist">
                out of {t.max} · {Math.round((100 * t.max) / total)}% of total
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {rows.map((r) => (
                <li key={r.slug} className="grid grid-cols-[minmax(0,7.5rem)_1fr_2.75rem] items-center gap-x-2 text-xs">
                  <Link href={`/tests/${r.slug}`} className="truncate text-mist hover:text-mist-bright">
                    {info[r.slug]?.title ?? r.slug}
                  </Link>
                  <div className="h-1.5" title={`${t.name}: ${r.score} / ${t.max}`}>
                    <div
                      className="h-full rounded-r-full"
                      style={{ width: `${share(r.score, t.max)}%`, background: r.score === best ? LEAD : REST }}
                    />
                  </div>
                  <span className="text-right tabular-nums text-mist-bright">{fmt(r.score)}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Step the accent down per test so stacked segments read as distinct bands. */
const SHADES = [1, 0.78, 0.6, 0.45, 0.32];

/** 4. Each total split into its tests, heaviest first: a bar's length is its
 *  total and each band shows where those points came from. */
function Composition({ board, info }: { board: Board; info: Record<string, Info> }) {
  const max = board.models[0]?.max ?? 1;
  const tests = byWeight(board.tests);
  return (
    <div className="rounded-lg border border-line p-4 sm:p-5">
      <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-mist">
        {tests.map((t, i) => (
          <li key={t.id} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: LEAD, opacity: SHADES[i % SHADES.length] }} />
            {t.name}
          </li>
        ))}
      </ul>
      <ol className="space-y-2">
        {board.models.map((m) => (
          <li key={m.slug} className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-x-3 text-xs sm:grid-cols-[minmax(0,13rem)_1fr]">
            <Link href={`/tests/${m.slug}`} className="truncate text-mist hover:text-mist-bright">
              {info[m.slug]?.title ?? m.slug}
            </Link>
            <div className="flex h-4 gap-px">
              {tests.map((t, j) => {
                const v = m.tests[t.id] ?? 0;
                return (
                  <div
                    key={t.id}
                    className="h-full last:rounded-r-sm"
                    style={{ width: `${share(v, max)}%`, background: LEAD, opacity: SHADES[j % SHADES.length] }}
                    title={`${t.name}: ${fmt(v)} / ${t.max}`}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** 5. The exact numbers: total first, then tests heaviest first. The top
 *  score in each column is marked rather than the gaps. */
function Table({
  board,
  info,
  leaders,
}: {
  board: Board;
  info: Record<string, Info>;
  leaders: ReturnType<typeof getLeaders>;
}) {
  const tests = byWeight(board.tests);
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-mist">
            <th className="px-4 py-2.5 font-normal">#</th>
            <th className="px-2 py-2.5 font-normal">Model</th>
            <th className="px-3 py-2.5 text-right font-normal">Total</th>
            {tests.map((t) => (
              <th key={t.id} className="px-2 py-2.5 text-right font-normal" title={`${t.name}, out of ${t.max}`}>
                {t.short} <span className="text-mist/70">/{t.max}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {board.models.map((m, i) => (
            <tr key={m.slug} className="border-b border-line last:border-0">
              <td className="px-4 py-2 tabular-nums text-mist">{i + 1}</td>
              <td className="px-2 py-2">
                <Link href={`/tests/${m.slug}`} className="text-mist-bright hover:text-glow">
                  {info[m.slug]?.title ?? m.slug}
                </Link>
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-mist-bright">
                {fmt(m.total)}
                <span className="text-mist"> / {m.max}</span>
              </td>
              {tests.map((t) => {
                const v = m.tests[t.id];
                const top = v != null && v === leaders[t.id]?.best;
                return (
                  <td key={t.id} className={`px-2 py-2 text-right tabular-nums ${top ? "text-glow" : "text-mist"}`}>
                    {v == null ? "–" : fmt(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-lg text-mist-bright">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-mist">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** The cross-model leaderboard, most important first: the top three, the full
 *  ranking, each test on its own, how totals are built, then exact numbers. */
export default function Leaderboard() {
  const board = getLeaderboard();
  if (!board || board.models.length === 0) return null;
  const info = getInfo();
  const leaders = getLeaders(board);

  return (
    <>
      <Podium board={board} info={info} />
      <Section title="Rankings" note={`Share of the ${board.models[0].max} available points, across all ${board.tests.length} tests.`}>
        <Rankings board={board} info={info} leaders={leaders} />
      </Section>
      <Section title="By test" note="Each test ranked on its own, heaviest first. Bars run to that test's maximum.">
        <PerTest board={board} info={info} leaders={leaders} />
      </Section>
      <Section title="Where the points come from" note="Each model's total, split into its tests.">
        <Composition board={board} info={info} />
      </Section>
      <Section title="All scores" note="Highlighted values are the top score in their column.">
        <Table board={board} info={info} leaders={leaders} />
      </Section>
    </>
  );
}
