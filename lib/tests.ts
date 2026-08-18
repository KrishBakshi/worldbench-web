import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { parseLadderScore, type LadderScore } from "@/lib/scores";
import { parsePlacementGraph, type PlacementGraphData } from "@/lib/graph";

const TESTS_DIR = path.join(process.cwd(), "public", "tests");

export interface IntroMedia {
  type: "video" | "gif";
  src: string;
}

export interface Test {
  slug: string;
  title: string;
  model: string;
  date: string;
  pinned: boolean;
  /** Key into PROVIDERS in lib/providers.ts. Null for the hand-tuned reference. */
  provider: string | null;
  introMedia: IntroMedia | null;
  /** Full URL of the X post walking through this result, if one exists. */
  xPostUrl: string | null;
  /** One or two sentences, shown under the title and used as the meta description. */
  summary: string;
  worldHtmlSrc: string;
  /**
   * The legend-free build of the same world, used by the comparison grid. Falls
   * back to world.html for a test that hasn't got one, so a missing preview
   * shows the world with its overlays rather than an empty panel.
   */
  worldPreviewSrc: string;
  /** Slim ladder from scores.json. Null until this model has been exported. */
  scores: LadderScore | null;
  /** WC002 extracted graph. Null until export copies graph.json. */
  graph: PlacementGraphData | null;
  content: string;
}

function loadTest(slug: string): Test | null {
  const dir = path.join(TESTS_DIR, slug);
  const metaPath = path.join(dir, "meta.mdx");
  if (!fs.existsSync(metaPath)) return null;

  const raw = fs.readFileSync(metaPath, "utf8");
  const { data, content } = matter(raw);

  let introMedia: IntroMedia | null = null;
  for (const [file, type] of [
    ["intro.mp4", "video"],
    ["intro.webm", "video"],
    ["intro.gif", "gif"],
  ] as const) {
    if (fs.existsSync(path.join(dir, file))) {
      introMedia = { type, src: `/tests/${slug}/${file}` };
      break;
    }
  }

  return {
    slug,
    title: data.title ?? slug,
    model: data.model ?? "Unknown model",
    date: data.date ?? "",
    pinned: Boolean(data.pinned),
    provider: typeof data.provider === "string" ? data.provider : null,
    introMedia,
    xPostUrl: typeof data.xPost === "string" ? data.xPost : null,
    summary: typeof data.summary === "string" ? data.summary : "",
    worldHtmlSrc: `/tests/${slug}/world.html`,
    worldPreviewSrc: fs.existsSync(path.join(dir, "world-preview.html"))
      ? `/tests/${slug}/world-preview.html`
      : `/tests/${slug}/world.html`,
    scores: loadScores(dir, slug),
    graph: loadGraph(dir),
    content: content.trim(),
  };
}

function loadGraph(dir: string): PlacementGraphData | null {
  const graphPath = path.join(dir, "graph.json");
  if (!fs.existsSync(graphPath)) return null;
  try {
    return parsePlacementGraph(JSON.parse(fs.readFileSync(graphPath, "utf8")));
  } catch {
    return null;
  }
}

function loadScores(dir: string, slug: string): LadderScore | null {
  const scoresPath = path.join(dir, "scores.json");
  if (!fs.existsSync(scoresPath)) return null;
  try {
    const parsed = parseLadderScore(JSON.parse(fs.readFileSync(scoresPath, "utf8")));
    if (parsed && parsed.slug !== slug) {
      return { ...parsed, slug };
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAllTests(): Test[] {
  if (!fs.existsSync(TESTS_DIR)) return [];
  return fs
    .readdirSync(TESTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => loadTest(entry.name))
    .filter((test): test is Test => test !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPinnedTests(limit = 4): Test[] {
  return getAllTests()
    .filter((test) => test.pinned)
    .slice(0, limit);
}

export function getTestBySlug(slug: string): Test | undefined {
  return getAllTests().find((test) => test.slug === slug);
}
