import Link from "next/link";
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
      className="h-3.5 w-3.5 shrink-0 -translate-x-0.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/**
 * The home-page call to action. Hovers exactly like the model cards on
 * Evaluations (FastCard): the same resting fill and border, then one 200ms
 * ease-out flip to a solid mist-bright fill with the text inverting to void,
 * so the button and the cards it leads to feel like one control. Both tokens
 * invert per theme, so no `[data-theme=day]` overrides are needed.
 *
 * The arrow gives the button a direction to point in: it nudges right on the
 * same 200ms, and `group` is needed because the arrow isn't itself the
 * hovered element, the whole button is.
 */
export default function ExploreEvaluationsButton() {
  return (
    <Link
      href="/tests"
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-lg border border-line px-7 py-3",
        "bg-[color-mix(in_srgb,var(--color-void-deep)_60%,transparent)]",
        "font-display text-xs uppercase tracking-[0.2em] text-mist-bright",
        "transition-colors duration-200 ease-out",
        "hover:border-mist/60 hover:bg-mist-bright hover:text-void",
      )}
    >
      <span>Explore Evaluations</span>
      <ArrowIcon />
    </Link>
  );
}
