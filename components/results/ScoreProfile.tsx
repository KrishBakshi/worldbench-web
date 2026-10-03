import type { TestScore } from "@/lib/results";

/** Views 1 and 2: the score profile as a polygon (each axis one test as a
 *  share of its maximum) beside the earned/max bars for the same tests. */
export default function ScoreProfile({ tests }: { tests: TestScore[] }) {
  const R = 92;
  const C = 130;
  const n = tests.length;
  const at = (i: number, r: number) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
  };
  const ring = (f: number) => tests.map((_, i) => at(i, R * f).join(",")).join(" ");
  const shape = tests
    .map((t, i) => at(i, R * (t.max ? Math.min(1, t.score / t.max) : 0)).join(","))
    .join(" ");

  return (
    <div className="grid gap-6 sm:grid-cols-[280px_1fr] sm:items-center">
      <svg viewBox="-34 -6 328 272" className="mx-auto h-auto w-full max-w-[280px]" role="img"
        aria-label={`Score profile: ${tests.map((t) => `${t.name} ${Math.round((100 * t.score) / (t.max || 1))}%`).join(", ")}`}>
        {[0.5, 1].map((f) => (
          <polygon key={f} points={ring(f)} fill="none" stroke="var(--color-line)" strokeWidth={1} />
        ))}
        {tests.map((_, i) => {
          const [x, y] = at(i, R);
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--color-line)" strokeWidth={1} />;
        })}
        <polygon points={shape} fill="var(--color-glow)" fillOpacity={0.18} stroke="var(--color-glow)" strokeWidth={2} strokeLinejoin="round" />
        {tests.map((t, i) => {
          const [x, y] = at(i, R + 22);
          return (
            <text key={t.id} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="var(--color-mist)">
              {t.short}
            </text>
          );
        })}
      </svg>

      <ul className="space-y-3">
        {tests.map((t) => {
          const pct = t.max ? Math.min(100, (100 * t.score) / t.max) : 0;
          return (
            <li key={t.id}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-mist-bright">{t.name}</span>
                <span className="tabular-nums text-mist">
                  {t.scored ? `${t.score} / ${t.max}` : "not scored"}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-glow)" }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
