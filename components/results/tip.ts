/**
 * Props that make a chart mark hoverable inside a <ChartHover>. Kept out of the
 * client module so server-rendered charts can call it while building markup.
 *
 * - `title` / `rows` are the tooltip: a heading, then label/value pairs, each
 *   with an optional swatch colour.
 * - `key` is what this mark lights up on hover: every mark in the same chart
 *   whose `groups` include it stays at full strength, the rest dim.
 * - `groups` defaults to the key itself; pass more to stay lit for other keys
 *   too (a graph node stays lit when one of its links is hovered).
 */
export type TipRow = [label: string, value: string, swatch?: string];

export function tip({
  title,
  rows = [],
  key,
  groups,
}: {
  title?: string;
  rows?: TipRow[];
  key?: string;
  groups?: string[];
}) {
  return {
    ...(title || rows.length ? { "data-tip": title ?? "", "data-tip-rows": JSON.stringify(rows), tabIndex: 0 } : {}),
    ...(key ? { "data-key": key } : {}),
    ...(key || groups ? { "data-groups": (groups ?? [key]).join(" ") } : {}),
  };
}

/** A mark that only joins a highlight group, with no hover of its own. */
export const member = (...groups: string[]) => ({ "data-groups": groups.join(" ") });
