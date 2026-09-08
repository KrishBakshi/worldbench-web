"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The test-grid card. Was LiquidButton-based like the homepage CTA, but the
 * grid can have a couple dozen of these on screen at once — a sweeping fill
 * animation per card reads as laggy rather than premium at that density.
 * This swaps to a plain background/border flip with a snap transition, so
 * hover feels instant. The liquid fill stays on the homepage CTA
 * (ExploreEvaluationsButton) where it's a single, deliberate button.
 *
 * `bg-mist-bright` / `text-void` are used deliberately over raw black/white:
 * both tokens invert per theme (light fill + dark text in dark mode, dark
 * fill + light text in day mode), so the hover state matches
 * LiquidCard's fill without any `[data-theme=day]` overrides here.
 */
function prefetchDocument(href: string) {
  if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "document";
  link.href = href;
  document.head.appendChild(link);
}

export default function FastCard({
  href,
  documentHref,
  children,
  className,
}: {
  href: string;
  /** World HTML to start fetching on hover, so the slug-page iframe is warm. */
  documentHref?: string | null;
  children: ReactNode;
  className?: string;
}) {
  const warm = () => {
    if (documentHref) prefetchDocument(documentHref);
  };

  return (
    <Link
      href={href}
      onPointerEnter={warm}
      onFocus={warm}
      className={cn(
        "group relative block overflow-hidden rounded-lg border border-line",
        "bg-[color-mix(in_srgb,var(--color-void-deep)_60%,transparent)]",
        "transition-colors duration-200 ease-out",
        "hover:border-mist/60 hover:bg-mist-bright",
        className,
      )}
    >
      {children}
    </Link>
  );
}
