import type { SVGProps } from "react";

/**
 * Nex. Artwork from the lab's own logo (https://nex.sii.edu.cn/logo/nex.svg),
 * rescaled from its 864-unit viewBox to the 24-unit one the rest of this set
 * uses; Nex is a trademark of its owner.
 *
 * The source draws the two arrowheads as black fills separated by a white
 * stroke. The stroke is dropped here, because the watermark is a single-colour
 * silhouette over the card and a hard white outline would cut through it. The
 * shapes keep their own gap without it.
 */
export default function NexIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.039 12.446C15.039 12.598 14.961 12.741 14.832 12.823C14.703 12.905 14.542 12.916 14.403 12.852L8.417 10.084L8.417 17.916C8.417 18.068 8.341 18.209 8.214 18.292L2.692 21.878C2.554 21.967 2.378 21.974 2.234 21.896C2.09 21.818 2 21.667 2 21.502V3.153C2 3.001 2.077 2.86 2.205 2.777C2.332 2.695 2.493 2.683 2.632 2.745L14.775 8.216C14.935 8.288 15.039 8.448 15.039 8.624V12.446Z" />
      <path d="M8.961 11.529C8.961 11.377 9.039 11.235 9.168 11.152C9.297 11.07 9.458 11.059 9.597 11.123L15.583 13.892L15.583 6.059C15.583 5.907 15.659 5.766 15.786 5.683L21.308 2.097C21.446 2.008 21.622 2.001 21.766 2.079C21.91 2.157 22 2.308 22 2.473L22 20.822C22 20.974 21.923 21.115 21.795 21.198C21.668 21.28 21.507 21.293 21.368 21.23L9.225 15.759C9.065 15.687 8.961 15.527 8.961 15.351L8.961 11.529Z" />
    </svg>
  );
}
