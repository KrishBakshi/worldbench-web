import type { WordmarkProps } from "./wordmark";

/**
 * The Nex wordmark. Artwork from the Nex-N2.5 repository
 * (nex-agi/Nex-N2.5, figures/NEX_logo.svg), rescaled from its 1118x354 box
 * onto the shared 24-unit baseline of 2 units of leading and 20 units of cap
 * height, so it sets at the same size as the vendored lobehub marks; Nex is a
 * trademark of its owner.
 */
export default function NexTextIcon({ size = "1em", style, ...rest }: WordmarkProps) {
  return (
    <svg
      viewBox="0 0 64 24"
      fill="currentColor"
      fillRule="evenodd"
      height={size}
      style={{ flex: "none", lineHeight: 1, ...style }}
      {...rest}
    >
      <path d="M56.524 13.555L55.212 11.912L53.656 9.966L53.625 10.003L51.232 12.996L49.961 14.588L49.932 14.624L49.93 14.626L48.657 16.218L47.834 15.186L46.52 13.543L44.099 16.573L42.827 18.165L39.831 21.913H47.217L47.793 21.194L50.213 18.165L51.486 16.573L51.488 16.572L52.8 18.214L53.624 19.246L55.757 21.913H63.144C61.863 20.295 59.014 16.692 57.349 14.586L56.524 13.555Z" />
      <path d="M47.793 11.965L49.105 13.608L49.107 13.606L49.137 13.569L50.408 11.978L52.8 8.985L52.83 8.948L54.103 7.356L54.927 8.388L56.483 10.335L61.775 3.713L62.513 2.788L63.144 2H55.757L52.789 5.713L51.518 7.304L51.488 7.342L47.392 2.219L47.217 2H39.831L47.794 11.963L47.793 11.965Z" />
      <path d="M28.333 16.788V14.532H42.488V9.393H28.333V7.139H42.463L38.356 2H23.446L23.448 21.927H38.356L42.463 16.788H28.333Z" />
      <path d="M15.914 16.078L7.649 10.695V17.044L15.177 21.946H22.312V21.927H22.312V2H15.914V16.078Z" />
      <path d="M6.399 7.868L14.663 13.251V6.902L7.135 2L0 2V2.019H0V21.946H6.399L6.399 7.868Z" />
    </svg>
  );
}
