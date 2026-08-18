import Link from "next/link";
import type { Metadata } from "next";
import { getAllTests } from "@/lib/tests";
import { getProvider } from "@/lib/providers";
import { formatPct, formatScore, type LadderTest, EMPTY, LADDER_COLUMNS } from "@/lib/scores";
import LeaderboardChart from "@/components/tests/LeaderboardChart";

export const metadata: Metadata = {
  title: "Leaderboard · worldbench",
  description:
    "Automated ladder scores for each model island, from voxel lattice through temporal cycles.",
};

function cell(row: LadderTest | undefined) {
  if (!row || !row.scored) {
    return <span className="text-mist">{EMPTY}</span>;
  }
  return (
    <span className={row.passed ? "text-mist-bright" : "text-mist"}>
      {formatScore(row.score, row.max_score)}
    </span>
  );
}

export default function LeaderboardPage() {
  const tests = getAllTests();
  const columns =
    tests.find((test) => test.scores)?.scores?.tests.map((row) => ({
      id: row.id,
      title: row.title,
    })) ?? [...LADDER_COLUMNS];

  const ranked = [...tests].sort((a, b) => {
    const as = a.scores;
    const bs = b.scores;
    if (as && !bs) return -1;
    if (!as && bs) return 1;
    if (as && bs) {
      if (as.incomplete !== bs.incomplete) return as.incomplete ? 1 : -1;
      return bs.pct - as.pct;
    }
    return b.date.localeCompare(a.date);
  });

  const ranks = new Map<string, number>();
  let nextRank = 0;
  for (const test of ranked) {
    if (test.scores && !test.scores.incomplete) {
      nextRank += 1;
      ranks.set(test.slug, nextRank);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <h1 className="font-display text-2xl text-mist-bright">Leaderboard</h1>
      <p className="mt-2 text-sm text-mist">
        Automated ladder from voxel lattice through temporal cycles. Open a
        model to see why a row failed.
      </p>

      <LeaderboardChart
        rows={ranked
          .filter((test) => test.scores)
          .map((test) => ({
            slug: test.slug,
            name: test.title,
            pct: test.scores?.pct ?? 0,
            provider: test.provider,
          }))}
      />

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[56rem] table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-14" />
            <col className="w-[24%]" />
            {columns.map((col) => (
              <col key={col.id} />
            ))}
            <col className="w-36" />
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-display text-[10px] font-normal uppercase tracking-[0.18em] text-mist">
                Rank
              </th>
              <th className="py-2 pr-3 font-display text-[10px] font-normal uppercase tracking-[0.18em] text-mist">
                Model
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-2 text-right align-bottom font-display text-[10px] font-normal uppercase leading-tight tracking-[0.14em] text-mist"
                >
                  {col.title}
                </th>
              ))}
              <th className="py-2 pl-3 text-right font-display text-[10px] font-normal uppercase tracking-[0.18em] text-mist">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((test) => {
              const rank = ranks.get(test.slug);
              const provider = getProvider(test.provider);
              return (
                <tr key={test.slug} className="border-b border-line">
                  <td className="py-3 pr-3 tabular-nums text-mist">
                    {rank ?? EMPTY}
                  </td>
                  <td className="py-3 pr-3">
                    <Link href={`/tests/${test.slug}`} className="text-mist-bright hover:text-mist">
                      {test.title}
                    </Link>
                    {test.scores?.incomplete && (
                      <span className="ml-2 font-display text-[10px] uppercase tracking-[0.14em] text-mist">
                        partial
                      </span>
                    )}
                    {provider && (
                      <div className="mt-0.5 text-xs text-mist">{provider.name}</div>
                    )}
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} className="px-3 py-3 text-right tabular-nums">
                      {cell(test.scores?.tests.find((row) => row.id === col.id))}
                    </td>
                  ))}
                  <td className="py-3 pl-3 text-right tabular-nums">
                    {test.scores ? (
                      <>
                        <span className="text-mist">
                          {formatScore(test.scores.total_score, test.scores.total_max_score)}
                        </span>{" "}
                        <span className="text-mist-bright">{formatPct(test.scores.pct)}</span>
                      </>
                    ) : (
                      <span className="text-mist">{EMPTY}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
