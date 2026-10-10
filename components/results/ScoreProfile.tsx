import type { TestScore } from "@/lib/results";
import ChartHover from "@/components/results/ChartHover";
import { member, tip } from "@/components/results/tip";

/** Views 1 and 2: the score profile as a polygon (each axis one test as a
 *  share of its maximum) beside the earned/max bars for the same tests. One
 *  hover layer spans both, so a test lit in one is lit in the other. */
export default function ScoreProfile({ tests }: { tests: TestScore[] }) {
  const R = 92;
  const C = 130;
  const n = tests.length;
  const at = (i: number, r: number) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
  };
  const ring = (f: number) => tests.map((_, i) => at(i, R * f).join(",")).join(" ");
  const frac = (t: TestScore) => (t.max ? Math.min(1, t.score / t.max) : 0);
  const shape = tests.map((t, i) => at(i, R * frac(t)).join(",")).join(" ");
  const tipFor = (t: TestScore) =>
    tip({
      title: t.name,
      key: t.id,
      rows: t.scored
        ? [
            ["Score", `${t.score} / ${t.max}`],
            ["Share of max", `${Math.round(100 * frac(t))}%`],
          ]
        : [["Score", "not scored"]],
    });

  return (
    <ChartHover>
      <div className="grid gap-6 sm:grid-cols-[280px_1fr] sm:items-center">
        <svg viewBox="-34 -6 328 272" className="mx-auto h-auto w-full max-w-[280px] overflow-visible" role="img"
          aria-label={`Score profile: ${tests.map((t) => `${t.name} ${Math.round(100 * frac(t))}%`).join(", ")}`}>
          {[0.5, 1].map((f) => (
            <polygon key={f} points={ring(f)} fill="none" stroke="var(--color-line)" strokeWidth={1} />
          ))}
          {/* The rings label themselves, just left of the top axis, so the
              scale reads without a legend. */}
          {[0.5, 1].map((f) => (
            <text key={f} x={C - 6} y={C - R * f + 3} textAnchor="end" fontSize="9" fill="var(--color-mist)">
              {f * 100}%
            </text>
          ))}
          {tests.map((t, i) => {
            const [x, y] = at(i, R);
            return <line key={t.id} x1={C} y1={C} x2={x} y2={y} stroke="var(--color-line)" strokeWidth={1} />;
          })}
          <polygon points={shape} fill="var(--color-glow)" fillOpacity={0.18} stroke="var(--color-glow)" strokeWidth={2} strokeLinejoin="round" />
          {tests.map((t, i) => {
            const [x, y] = at(i, R * frac(t));
            return (
              <g key={t.id} {...tipFor(t)}>
                {/* Wider invisible target than the visible dot. */}
                <circle cx={x} cy={y} r={12} fill="transparent" />
                <circle cx={x} cy={y} r={4.5} fill="var(--color-glow)" stroke="var(--color-void)" strokeWidth={2} />
              </g>
            );
          })}
          {tests.map((t, i) => {
            const [x, y] = at(i, R + 22);
            return (
              <text key={t.id} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="var(--color-mist)" {...member(t.id)}>
                {t.short}
              </text>
            );
          })}
        </svg>

        <ul className="space-y-3">
          {tests.map((t) => (
            <li key={t.id} {...tipFor(t)}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-mist-bright">{t.name}</span>
                <span className="tabular-nums text-mist">
                  {t.scored ? `${t.score} / ${t.max}` : "not scored"}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-data-muted)" }}>
                <div className="h-full rounded-full" style={{ width: `${100 * frac(t)}%`, background: "var(--color-glow)" }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ChartHover>
  );
}
