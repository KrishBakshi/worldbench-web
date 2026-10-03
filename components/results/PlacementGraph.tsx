import { BIOME_NODES, borderPoint } from "@/lib/biomes";
import type { ModelResults, PlacementState } from "@/lib/results";

const FAIL = "#e5534b";
const byId = Object.fromEntries(BIOME_NODES.map((n) => [n.id, n]));

const linkStyle = {
  required: { stroke: "var(--color-glow)", dash: undefined, width: 1.6 },
  missing: { stroke: "var(--color-mist)", dash: "4 4", width: 1.2 },
  forbidden: { stroke: FAIL, dash: undefined, width: 1.4 },
} as const;

const nodeStyle: Record<PlacementState, { stroke: string; dash?: string }> = {
  ok: { stroke: "var(--color-glow)" },
  fail: { stroke: FAIL },
  uncovered: { stroke: "var(--color-mist)", dash: "4 4" },
};

/** View 4: placement. Same layout as the prompt's biome graph; only the links
 *  the prompt's rules speak about are drawn, and each biome is outlined by its
 *  verdict. */
export default function PlacementGraph({ data }: { data: NonNullable<ModelResults["placement"]> }) {
  const state = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
  const heightNote = data.nodes.filter((n) => n.reason);

  return (
    <div className="not-prose w-full overflow-x-auto">
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
            <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
              stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} />
          );
        })}
        {BIOME_NODES.map((node) => {
          const st = nodeStyle[state[node.id]?.state as PlacementState] ?? nodeStyle.uncovered;
          return (
            <g key={node.id}>
              <rect x={node.cx - node.w / 2} y={node.cy - node.h / 2} width={node.w} height={node.h} rx={8}
                fill="var(--color-void-deep)" stroke={st.stroke} strokeWidth={1.8} strokeDasharray={st.dash} />
              <text x={node.cx} y={node.cy + 5} textAnchor="middle" fontSize="13" fill="var(--color-mist-bright)">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-mist">
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-5" style={{ background: "var(--color-glow)" }} />
          Required link, present
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed" style={{ borderColor: "var(--color-mist)" }} />
          Required link, missing
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-5" style={{ background: FAIL }} />
          Forbidden link, present
        </li>
      </ul>
      {data.heightOrder.length > 0 && (
        <p className="mt-2 text-xs text-mist">
          Height, highest first: {data.heightOrder.map((b) => byId[b]?.label ?? b).join(" › ")}
          {heightNote.length > 0 && (
            <span className="text-mist-bright"> · {heightNote.map((n) => `${byId[n.id]?.label ?? n.id}: ${n.reason}`).join("; ")}</span>
          )}
        </p>
      )}
    </div>
  );
}
