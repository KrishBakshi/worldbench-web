import { getAllTests } from "@/lib/tests";
import { getProvider } from "@/lib/providers";
import TestBrowser, { type ProviderOption } from "@/components/tests/TestBrowser";

export default function TestGrid() {
  const tests = getAllTests();

  // One badge per provider that actually has a test, in first-seen order
  // (tests come pre-sorted newest first). `other` is always last — it's a
  // catch-all, not a lab, so it shouldn't sit among the company filters.
  const providers: ProviderOption[] = [];
  const seen = new Set<string>();
  for (const test of tests) {
    if (!test.provider || seen.has(test.provider)) continue;
    const provider = getProvider(test.provider);
    if (!provider) continue;
    seen.add(test.provider);
    providers.push({ slug: test.provider, name: provider.name });
  }
  providers.sort((a, b) => {
    if (a.slug === "other") return 1;
    if (b.slug === "other") return -1;
    return 0;
  });

  return <TestBrowser tests={tests} providers={providers} />;
}
