/** The ten biomes' positions on the site's relationship graphs (SVG units,
 *  viewBox 800 x 560). Shared by the prompt's BiomeGraph and each model's
 *  PlacementGraph so both draw the island the same way. */
export type BiomeNode = {
  id: string;
  label: string;
  /** Node centre, in SVG units. Rects are derived from this so edges can be
   *  clipped to the border toward their neighbour. */
  cx: number;
  cy: number;
  w: number;
  h: number;
  isolated?: boolean;
  note?: string;
};

export const BIOME_NODES: BiomeNode[] = [
  { id: "mountains", label: "Snow Mountains", cx: 340, cy: 52, w: 176, h: 46 },
  { id: "forest", label: "Snowy Conifer Forest", cx: 340, cy: 145, w: 190, h: 46 },
  { id: "highlands", label: "Highlands", cx: 130, cy: 172, w: 168, h: 46 },
  { id: "jungle", label: "Dense Jungle", cx: 362, cy: 252, w: 168, h: 46 },
  { id: "swamp", label: "Backwater Swamp", cx: 95, cy: 322, w: 168, h: 46 },
  { id: "grove", label: "Flowering Grove", cx: 250, cy: 438, w: 168, h: 46 },
  { id: "grassland", label: "Grassland Plateau", cx: 372, cy: 372, w: 180, h: 46 },
  { id: "delta", label: "Coastal Delta / Ocean", cx: 348, cy: 512, w: 200, h: 46 },
  {
    id: "desert",
    label: "Desert Basin",
    cx: 652,
    cy: 330,
    w: 180,
    h: 46,
    isolated: true,
    note: "arid — only fading dry washes",
  },
  {
    id: "volcano",
    label: "Volcano",
    cx: 662,
    cy: 128,
    w: 168,
    h: 46,
    isolated: true,
    note: "isolated — lava, not water",
  },
];

/** Point where the ray from a node's centre toward `target` crosses its border,
 *  pushed out by `pad` so arrowheads sit just clear of the box. */
export function borderPoint(node: BiomeNode, target: BiomeNode, pad = 4) {
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
