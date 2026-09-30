import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTests, getTestBySlug, type Test } from "@/lib/tests";
import CompareModels, {
  MAX_PANELS,
  type CompareEntry,
} from "@/components/tests/CompareModels";

const toEntry = (t: Test): CompareEntry => ({
  slug: t.slug,
  title: t.title,
  model: t.model,
  provider: t.provider,
  worldPreviewSrc: t.worldPreviewSrc,
});

/**
 * `/compare/a+b+c` → tests a, b, c. Decoded first in case a client escaped the
 * "+" as %2B. Unknown and repeated slugs are dropped; the grid is capped like
 * the dialog.
 */
function resolve(param: string): Test[] {
  const seen = new Set<string>();
  const tests: Test[] = [];
  for (const slug of decodeURIComponent(param).split("+")) {
    const test = getTestBySlug(slug);
    if (!test || seen.has(slug)) continue;
    seen.add(slug);
    tests.push(test);
    if (tests.length === MAX_PANELS) break;
  }
  return tests;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugs: string }>;
}): Promise<Metadata> {
  const { slugs } = await params;
  const tests = resolve(slugs);
  if (tests.length === 0) return {};
  const title = `${tests.map((t) => t.model).join(" vs ")} — worldbench`;
  return { title, openGraph: { title } };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slugs: string }>;
}) {
  const { slugs } = await params;
  const tests = resolve(slugs);
  if (tests.length === 0) notFound();

  const panels = tests.map(toEntry);
  return (
    <CompareModels
      standalone
      current={panels[0]}
      initialPanels={panels}
      entries={getAllTests().map(toEntry)}
    />
  );
}
