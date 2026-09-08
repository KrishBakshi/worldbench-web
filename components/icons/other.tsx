import type { SVGProps } from "react";

/**
 * Other — catch-all for anonymous or unbranded listings (OpenRouter's
 * unlabeled drops, models with no disclosed lab yet). There is no company
 * called Stealth, so those entries sit here rather than under a fake
 * provider name.
 *
 * Mark is a generic silhouette (OpenRouter's unbranded-listing favicon,
 * https://openrouter.ai/images/icons/Stealth.svg), background circle
 * dropped and coordinates rescaled from a 240-unit to a 24-unit viewBox,
 * then scaled up further (~1.43x, centered) to span the full 20-unit width
 * the rest of this set uses — the raw rescale left it reading small and
 * thin next to the other marks.
 */
export default function OtherIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 5.57 4.86 14.14 2 17l2.14 1.43L12 14.14l7.86 4.29L22 17l-2.86-2.86z" />
      <path d="M9.14 14.14 12 17l2.86-2.86z" />
    </svg>
  );
}
