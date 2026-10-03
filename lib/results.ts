import fs from "fs";
import path from "path";

/**
 * Scores exported from the worldbench harness (scripts/export_to_web.py).
 * Test ids (WC001..WC005) are keys only; the site always shows `name`/`short`.
 */

export interface TestScore {
  id: string;
  name: string;
  short: string;
  score: number;
  max: number;
  scored: boolean;
}

export type PlacementState = "ok" | "fail" | "uncovered";

export interface PlacementLink {
  from: string;
  to: string;
  /** required = a link the prompt asks for and the world has; missing = asked
   *  for but absent; forbidden = present although the prompt rules it out. */
  kind: "required" | "missing" | "forbidden";
}

export interface ModelResults {
  schema: number;
  slug: string;
  total: { score: number; max: number };
  complete: boolean;
  tests: TestScore[];
  /** Per-biome scores out of 10, in `ids` order; a test that wasn't run is null. */
  biomes?: { ids: string[]; WC003: number[] | null; WC004: number[] | null };
  placement?: {
    nodes: { id: string; state: PlacementState; reason?: string }[];
    links: PlacementLink[];
    heightOrder: string[];
  };
}

export interface Leaderboard {
  schema: number;
  tests: { id: string; name: string; short: string; max: number }[];
  models: { slug: string; total: number; max: number; complete: boolean; tests: Record<string, number> }[];
}

const PUBLIC = path.join(process.cwd(), "public");

function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function getResults(slug: string): ModelResults | null {
  return readJson<ModelResults>(path.join(PUBLIC, "tests", slug, "results.json"));
}

export function getLeaderboard(): Leaderboard | null {
  return readJson<Leaderboard>(path.join(PUBLIC, "leaderboard.json"));
}
