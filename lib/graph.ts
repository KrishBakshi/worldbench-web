export interface GraphNode {
  id: string;
  label: string;
  passed: boolean;
  reason: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  isolated?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface PlacementGraphData {
  viewBox: { width: number; height: number };
  score: number;
  max_score: number;
  passed: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function parsePlacementGraph(raw: unknown): PlacementGraphData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return null;

  const view = (data.viewBox && typeof data.viewBox === "object"
    ? data.viewBox
    : {}) as Record<string, unknown>;

  const nodes: GraphNode[] = [];
  for (const item of data.nodes) {
    if (!item || typeof item !== "object") continue;
    const n = item as Record<string, unknown>;
    if (typeof n.id !== "string") continue;
    nodes.push({
      id: n.id,
      label: typeof n.label === "string" ? n.label : n.id,
      passed: Boolean(n.passed),
      reason: typeof n.reason === "string" ? n.reason : "",
      cx: num(n.cx),
      cy: num(n.cy),
      w: num(n.w, 168),
      h: num(n.h, 46),
      isolated: n.isolated ? true : undefined,
    });
  }
  if (!nodes.length) return null;

  const edges: GraphEdge[] = [];
  for (const item of data.edges) {
    if (!item || typeof item !== "object") continue;
    const e = item as Record<string, unknown>;
    if (typeof e.from !== "string" || typeof e.to !== "string") continue;
    edges.push({ from: e.from, to: e.to });
  }

  return {
    viewBox: {
      width: num(view.width, 800),
      height: num(view.height, 560),
    },
    score: num(data.score),
    max_score: num(data.max_score, 10),
    passed: Boolean(data.passed),
    nodes,
    edges,
  };
}
