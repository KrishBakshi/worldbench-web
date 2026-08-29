import fs from "fs";
import path from "path";
import matter from "gray-matter";

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
  /**
   * A short caveat about the entry itself — e.g. an unverified/anonymous
   * provider — rendered as a standalone badge on the detail page rather than
   * folded into `summary`'s prose. Optional; most tests won't have one.
   */
  notice: string | null;
  worldHtmlSrc: string;
  /**
   * The legend-free build of the same world, used by the comparison grid. Falls
   * back to world.html for a test that hasn't got one, so a missing preview
   * shows the world with its overlays rather than an empty panel.
   */
  worldPreviewSrc: string;
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
    notice: typeof data.notice === "string" ? data.notice : null,
    worldHtmlSrc: `/tests/${slug}/world.html`,
    worldPreviewSrc: fs.existsSync(path.join(dir, "world-preview.html"))
      ? `/tests/${slug}/world-preview.html`
      : `/tests/${slug}/world.html`,
    content: content.trim(),
  };
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
