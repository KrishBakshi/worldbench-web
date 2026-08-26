import type { SVGProps } from "react";

/**
 * Stealth — the anonymous OpenRouter provider Ox Alpha (and other unbranded
 * "stealth" releases) ship under. There is no disclosed company behind it, so
 * no real brand mark exists in Simple Icons or @lobehub/icons-static-svg.
 *
 * Mark is OpenRouter's own generic favicon for this provider (a stealth-
 * bomber silhouette, https://openrouter.ai/images/icons/Stealth.svg),
 * background circle dropped and coordinates rescaled from a 240-unit to a
 * 24-unit viewBox, then scaled up further (~1.43x, centered) to span the
 * full 20-unit width the rest of this set uses — the raw rescale left it
 * reading small and thin next to the other marks.
 */
export default function StealthIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 5.57 4.86 14.14 2 17l2.14 1.43L12 14.14l7.86 4.29L22 17l-2.86-2.86z" />
      <path d="M9.14 14.14 12 17l2.86-2.86z" />
    </svg>
  );
}
