import { formatPct, formatScore, EMPTY, testPct, type LadderScore } from "@/lib/scores";
import type { PlacementGraphData } from "@/lib/graph";
import PlacementGraph from "@/components/tests/PlacementGraph";

const BAR_OPACITY = [0.28, 0.4, 0.52, 0.64, 0.78, 1];

export default function ScoreLadder({
  scores,
  graph,
}: {
  scores: LadderScore;
  graph?: PlacementGraphData | null;
}) {
  const total = formatScore(scores.total_score, scores.total_max_score);
  const pending = scores.tests.filter((row) => !row.scored).map((row) => row.title);

  return (
    <section className="mt-10 border-t border-line pt-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-base text-mist-bright">Ladder</h2>
        <p className="text-sm tabular-nums text-mist-bright">
          {total}
          <span className="ml-2 text-mist">{formatPct(scores.pct)}</span>
        </p>
      </div>
      {scores.incomplete && (
        <p className="mt-2 text-sm text-mist">
          {pending.length
            ? `${pending.join(", ")} not scored in this run.`
            : "Partial ladder."}
        </p>
      )}

      <ol className="mt-6">
        {scores.tests.map((row, i) => {
          const mark = row.scored ? formatScore(row.score, row.max_score) : EMPTY;
          const pct = testPct(row);
          const width = pct === null ? 0 : Math.max(pct * 100, pct > 0 ? 1.5 : 0);
          const failed = row.scored && !row.passed && row.lost.length > 0;
          const graphBlock =
            row.id === "WC002" && graph ? <PlacementGraph graph={graph} /> : null;
          const expandable = failed || Boolean(graphBlock);
          const body = (
            <div className="py-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-sm text-mist-bright">{row.title}</span>
                </div>
                <span
                  className={`shrink-0 text-sm tabular-nums ${
                    row.scored ? "text-mist-bright" : "text-mist"
                  }`}
                >
                  {mark}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-line">
                <div
                  className="h-full bg-mist-bright"
                  style={{ width: `${width}%`, opacity: BAR_OPACITY[i] ?? 1 }}
                />
              </div>
            </div>
          );

          if (!expandable) {
            return (
              <li key={row.id} className="border-b border-line">
                {body}
              </li>
            );
          }

          return (
            <li key={row.id} className="border-b border-line">
              <details>
                <summary
                  className="cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                  title={failed ? "Show why this failed" : "Show placement graph"}
                >
                  {body}
                </summary>
                {failed && (
                  <ul className="pb-3 text-sm text-mist">
                    {row.lost.map((item) => (
                      <li key={item.id} className="mt-1.5">
                        {item.label.replace(/\u2014/g, ",").replace(/\u2013/g, "-")}
                        {item.why ? (
                          <span className="ml-2 font-display text-[10px] uppercase tracking-[0.14em] text-mist/70">
                            {item.why.replace(/_/g, " ")}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
                {graphBlock}
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
