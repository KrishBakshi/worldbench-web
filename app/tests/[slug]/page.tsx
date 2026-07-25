import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllTests, getTestBySlug, type Test } from "@/lib/tests";
import WorldEmbed from "@/components/tests/WorldEmbed";
import CompareModels, { type CompareEntry } from "@/components/tests/CompareModels";
import XPostEmbed from "@/components/tests/XPostEmbed";
import ProviderByline from "@/components/tests/ProviderByline";
import ContributeCTA from "@/components/tests/ContributeCTA";
import SocialLinks from "@/components/about/SocialLinks";
import BiomeGraph from "@/components/about/BiomeGraph";

export function generateStaticParams() {
  return getAllTests().map((test) => ({ slug: test.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = getTestBySlug(slug);
  if (!test) return {};

  const description = test.summary || `${test.model} generating a floating biome island.`;

  return {
    title: `${test.title} — worldbench`,
    description,
    openGraph: {
      title: `${test.title} — worldbench`,
      description,
    },
  };
}

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const test = getTestBySlug(slug);
  if (!test) notFound();

  // Parsed as UTC so an ISO date like "2026-07-20" doesn't shift a day in
  // negative-offset timezones.
  const formattedDate = test.date
    ? new Date(test.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

  // Every test is a candidate for the comparison grid, trimmed to the fields it
  // labels a panel with so the MDX bodies stay on the server.
  const toCompareEntry = (t: Test): CompareEntry => ({
    slug: t.slug,
    title: t.title,
    model: t.model,
    provider: t.provider,
    worldPreviewSrc: t.worldPreviewSrc,
  });
  const compareCurrent = toCompareEntry(test);
  const compareEntries = getAllTests().map(toCompareEntry);

  return (
    <section className="mx-auto max-w-3xl px-6 py-10 md:px-10">
      <Link href="/tests" className="text-sm text-mist hover:text-mist-bright">
        &larr; Back
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl text-mist-bright">{test.title}</h1>
        {formattedDate && (
          <time
            dateTime={test.date}
            className="mt-1 shrink-0 text-sm text-mist tabular-nums"
          >
            {formattedDate}
          </time>
        )}
      </div>
      <ProviderByline provider={test.provider} />

      {test.summary && <p className="mt-4 text-sm text-mist">{test.summary}</p>}

      {test.introMedia && (
        <div className="mt-8 aspect-video w-full overflow-hidden rounded-lg border border-line">
          {test.introMedia.type === "video" ? (
            <video
              src={test.introMedia.src}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={test.introMedia.src} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      )}

      <div className="mt-8">
        <WorldEmbed src={test.worldHtmlSrc} />
      </div>

      {/* The row under the world: the comparison opener first, then the link out
          to the walkthrough post, separated by a rule. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <CompareModels current={compareCurrent} entries={compareEntries} />
        {test.xPostUrl && (
          <>
            <span aria-hidden="true" className="text-line select-none">
              |
            </span>
            <XPostEmbed url={test.xPostUrl} />
          </>
        )}
      </div>

      {test.content && (
        <div className="prose mt-8 max-w-none text-sm">
          <MDXRemote source={test.content} components={{ SocialLinks, BiomeGraph }} />
        </div>
      )}

      <ContributeCTA />
    </section>
  );
}
