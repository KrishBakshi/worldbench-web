import { BIOME_NODES, borderPoint } from "@/lib/biomes";
import type { ModelResults, PlacementState } from "@/lib/results";
import ChartHover from "@/components/results/ChartHover";
import { tip, type TipRow } from "@/components/results/tip";

const FAIL = "#e5534b";
const byId = Object.fromEntries(BIOME_NODES.map((n) => [n.id, n]));

const linkStyle = {
  required: { stroke: "var(--color-glow)", dash: undefined, width: 1.6, label: "Required, present" },
  missing: { stroke: "var(--color-mist)", dash: "4 4", width: 1.2, label: "Required, missing" },
  forbidden: { stroke: FAIL, dash: undefined, width: 1.4, label: "Forbidden, present" },
} as const;

const nodeStyle: Record<PlacementState, { stroke: string; dash?: string; label: string }> = {
  ok: { stroke: "var(--color-glow)", label: "Placed as asked" },
  fail: { stroke: FAIL, label: "Breaks a placement rule" },
  uncovered: { stroke: "var(--color-mist)", dash: "4 4", label: "Not found in the world" },
};

/** View 4: placement. Same layout as the prompt's biome graph; only the links
 *  the prompt's rules speak about are drawn, and each biome is outlined by its
 *  verdict. Hovering a biome lights it, its links and its neighbours; hovering
 *  a link lights it and its two ends. */
export default function PlacementGraph({ data }: { data: NonNullable<ModelResults["placement"]> }) {
  const state = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
  const heightNote = data.nodes.filter((n) => n.reason);
  const label = (id: string) => byId[id]?.label ?? id;

  // Per biome: the keys of its links and the biomes at their other ends.
  const touching: Record<string, { links: string[]; neighbours: string[] }> = {};
  data.links.forEach((l, i) => {
    for (const [a, b] of [[l.from, l.to], [l.to, l.from]]) {
      touching[a] ??= { links: [], neighbours: [] };
      touching[a].links.push(`link-${i}`);
      touching[a].neighbours.push(b);
    }
  });

  return (
    <ChartHover className="not-prose w-full">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 800 560" className="h-auto w-full min-w-[560px]" role="img"
          aria-label="Placement: required links present, forbidden links present, and each biome's verdict">
          {data.links.map((l, i) => {
            const a = byId[l.from];
            const b = byId[l.to];
            if (!a || !b) return null;
            const p1 = borderPoint(a, b, 2);
            const p2 = borderPoint(b, a, 2);
            const s = linkStyle[l.kind];
            return (
              <g key={i} {...tip({
                title: `${a.label} – ${b.label}`,
                key: `link-${i}`,
                groups: [`link-${i}`, l.from, l.to],
                rows: [["Link", s.label, s.stroke]],
              })}>
                {/* Wide transparent stroke: a 1.5px line is too thin to point at. */}
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={14} />
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} />
              </g>
            );
          })}
          {BIOME_NODES.map((node) => {
            const n = state[node.id];
            const st = nodeStyle[n?.state as PlacementState] ?? nodeStyle.uncovered;
            const own = data.links.filter((l) => l.from === node.id || l.to === node.id);
            const rows: TipRow[] = [["Verdict", st.label, st.stroke]];
            for (const kind of ["required", "missing", "forbidden"] as const) {
              const count = own.filter((l) => l.kind === kind).length;
              if (count) rows.push([linkStyle[kind].label, String(count), linkStyle[kind].stroke]);
            }
            if (n?.reason) rows.push(["Note", n.reason]);
            return (
              <g key={node.id} {...tip({
                title: node.label,
                key: node.id,
                groups: [node.id, ...(touching[node.id]?.links ?? []), ...(touching[node.id]?.neighbours ?? [])],
                rows,
              })}>
                <rect x={node.cx - node.w / 2} y={node.cy - node.h / 2} width={node.w} height={node.h} rx={8}
                  fill="var(--color-void-deep)" stroke={st.stroke} strokeWidth={1.8} strokeDasharray={st.dash} />
                <text x={node.cx} y={node.cy + 5} textAnchor="middle" fontSize="13" fill="var(--color-mist-bright)">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-mist">
        {Object.values(linkStyle).map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            {s.dash ? (
              <span className="inline-block h-0 w-5 border-t-2 border-dashed" style={{ borderColor: s.stroke }} />
            ) : (
              <span className="inline-block h-0.5 w-5" style={{ background: s.stroke }} />
            )}
            {s.label.replace(",", " link,")}
          </li>
        ))}
      </ul>
      <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-mist">
        {Object.values(nodeStyle).map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className={`inline-block h-3 w-5 rounded-sm border-2 ${s.dash ? "border-dashed" : ""}`} style={{ borderColor: s.stroke }} />
            Biome: {s.label.charAt(0).toLowerCase() + s.label.slice(1)}
          </li>
        ))}
      </ul>
      {data.heightOrder.length > 0 && (
        <p className="mt-2 text-xs text-mist">
          Height, highest first: {data.heightOrder.map(label).join(" › ")}
          {heightNote.length > 0 && (
            <span className="text-mist-bright"> · {heightNote.map((n) => `${label(n.id)}: ${n.reason}`).join("; ")}</span>
          )}
        </p>
      )}
    </ChartHover>
  );
}
