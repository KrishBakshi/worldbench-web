"use client";

import Link from "next/link";
import { LiquidButton } from "@/components/animate-ui/primitives/buttons/liquid";
import { cn } from "@/lib/utils";

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 -translate-x-0.5 transition-transform duration-[190ms] ease-out group-hover:translate-x-0.5"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/**
 * The home-page call to action. Reuses the same liquid-fill primitive as the
 * test cards — a rising fill of mist-bright (white in dark mode, near-black in
 * day) — so the text inverts to void as the fill covers it.
 *
 * The arrow gives the button a direction to point in, rather than just a
 * static label — it nudges right on hover, the same way the fill and text
 * both move to signal "go". `group` is needed here (unlike the plain
 * `hover:` on the text/border below) because the arrow isn't itself the
 * hovered element, the whole button is.
 */
export default function ExploreEvaluationsButton() {
  return (
    <LiquidButton
      asChild
      // Match LiquidCard's feel but faster: 0.2s / 1.25 / 1.25 ≈ 0.13s.
      delay="0.13s"
      fillHeight="4px"
      hoverScale={1.02}
      tapScale={0.98}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-md",
        "border border-line px-7 py-3",
        "font-display text-xs uppercase tracking-[0.2em]",
        // hover:, not group-hover: — the button is the hovered element itself, so
        // the text inverts to void as the fill (mist-bright) rises to cover it.
        // Also faster: 300ms / 1.25 / 1.25 ≈ 190ms.
        "text-mist-bright transition-[color,border-color] duration-[190ms] hover:text-void hover:border-mist/60",
        // Rest fill background and the fill colour, mirroring LiquidCard.
        "[--liquid-button-background-color:color-mix(in_srgb,var(--color-void-deep)_60%,transparent)]",
        "[--liquid-button-color:#ffffff] [[data-theme=day]_&]:[--liquid-button-color:#121214]",
      )}
    >
      <Link href="/tests">
        <span>Explore Evaluations</span>
        <ArrowIcon />
      </Link>
    </LiquidButton>
  );
}
