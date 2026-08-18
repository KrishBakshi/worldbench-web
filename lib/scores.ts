export interface LostItem {
  id: string;
  label: string;
  why?: string;
}

export interface LadderTest {
  id: string;
  dir_name: string;
  title: string;
  score: number;
  max_score: number;
  passed: boolean;
  scored: boolean;
  reason: string;
  lost: LostItem[];
}

export interface LadderScore {
  slug: string;
  total_score: number;
  total_max_score: number;
  pct: number;
  passed: boolean;
  incomplete: boolean;
  tests: LadderTest[];
}

export function parseLadderScore(raw: unknown): LadderScore | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<LadderScore>;
  if (typeof data.slug !== "string" || !Array.isArray(data.tests)) return null;
  return {
    slug: data.slug,
    total_score: Number(data.total_score) || 0,
    total_max_score: Number(data.total_max_score) || 0,
    pct: Number(data.pct) || 0,
    passed: Boolean(data.passed),
    incomplete: Boolean(data.incomplete),
    tests: data.tests.map((row) => ({
      id: row.id,
      dir_name: row.dir_name,
      title: row.title,
      score: Number(row.score) || 0,
      max_score: Number(row.max_score) || 0,
      passed: Boolean(row.passed),
      scored: Boolean(row.scored),
      reason: row.reason ?? "",
      lost: Array.isArray(row.lost) ? row.lost : [],
    })),
  };
}

export function formatScore(score: number, max: number): string {
  const s = Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/\.?0+$/, "");
  const m = Number.isInteger(max) ? String(max) : max.toFixed(2).replace(/\.?0+$/, "");
  return `${s}/${m}`;
}

export function formatPct(pct: number): string {
  return `${Math.round(pct * 100)}%`;
}

export function testPct(row: LadderTest): number | null {
  if (!row.scored || !row.max_score) return null;
  return row.score / row.max_score;
}

/** Fallback column titles when no scores.json has been exported yet. */
export const LADDER_COLUMNS = [
  { id: "WC000", title: "Voxel lattice" },
  { id: "WC001", title: "Biome coverage" },
  { id: "WC002", title: "Placement graph" },
  { id: "WC003", title: "Micro-contents" },
  { id: "WC004", title: "Physics" },
  { id: "WC005", title: "Temporal cycles" },
] as const;

export const EMPTY = "n/a";
