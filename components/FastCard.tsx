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
export default function FastCard({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
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
