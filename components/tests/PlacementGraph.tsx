import type { GraphNode, PlacementGraphData } from "@/lib/graph";

const OK = "#2ecc71";
const FAIL = "#e74c3c";

function borderPoint(node: GraphNode, target: GraphNode, pad = 4) {
  const dx = target.cx - node.cx;
  const dy = target.cy - node.cy;
  const hw = node.w / 2;
  const hh = node.h / 2;
  const scale = Math.min(
    Math.abs(dx) < 1e-6 ? Infinity : hw / Math.abs(dx),
    Math.abs(dy) < 1e-6 ? Infinity : hh / Math.abs(dy),
  );
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: node.cx + dx * scale + (dx / len) * pad,
    y: node.cy + dy * scale + (dy / len) * pad,
  };
}

export default function PlacementGraph({ graph }: { graph: PlacementGraphData }) {
  const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const { width, height } = graph.viewBox;

  return (
    <div className="mt-3 mb-4 w-full overflow-x-auto rounded-lg border border-line p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[640px]"
        role="img"
        aria-label="Extracted biome placement graph. Green outlines passed the adjacency and elevation rules; red outlines failed."
      >
        {graph.edges.map((edge, i) => {
          const a = byId[edge.from];
          const b = byId[edge.to];
          if (!a || !b) return null;
          const p1 = borderPoint(a, b);
          const p2 = borderPoint(b, a);
          return (
            <line
              key={`${edge.from}-${edge.to}-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--color-mist)"
              strokeWidth={1.5}
              strokeOpacity={0.55}
            />
          );
        })}

        {graph.nodes.map((node) => (
          <g key={node.id}>
            <title>{node.reason ? `${node.label}: ${node.reason}` : node.label}</title>
            <rect
              x={node.cx - node.w / 2}
              y={node.cy - node.h / 2}
              width={node.w}
              height={node.h}
              rx={8}
              fill="var(--color-void-deep)"
              stroke={node.passed ? OK : FAIL}
              strokeWidth={2.5}
              strokeDasharray={node.isolated ? "4 4" : undefined}
            />
            <text
              x={node.cx}
              y={node.cy + 5}
              textAnchor="middle"
              fontSize="13"
              fill="var(--color-mist-bright)"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-mist">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border-2" style={{ borderColor: OK }} />
          Passed adjacency and elevation
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm border-2" style={{ borderColor: FAIL }} />
          Failed a placement rule
        </li>
      </ul>
    </div>
  );
}
