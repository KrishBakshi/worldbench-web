import { BIOME_NODES } from "@/lib/biomes";
import ChartHover from "@/components/results/ChartHover";
import { tip } from "@/components/results/tip";

const LABEL = Object.fromEntries(BIOME_NODES.map((n) => [n.id, n.label]));
/** Column heads: the biome id ("mountains"), capitalised; the full label is the tooltip. */
const head = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
/** Cell fill: neutral grey at 0, the accent at 10. Starting from grey rather
 *  than the page means a zero still reads as a cell, not a gap. */
// Value ink is written out in full: Tailwind only emits @theme variables
// whose names appear literally in source, so a built-up name would vanish.
const fill = (v: number) => `color-mix(in oklab, var(--color-glow) ${Math.round(v * 10)}%, var(--color-data-muted))`;

/** The heatmap's colour key, 0 to 10. Exported so the block can set it on
 *  its note line rather than spending a line of its own. */
export function BiomeScale() {
  return (
    <span className="flex items-center gap-2 text-xs text-mist" aria-label="Colour scale, 0 to 10 points">
      <span className="tabular-nums">0</span>
      <span className="flex h-2.5 w-28 overflow-hidden rounded-sm">
        {Array.from({ length: 11 }, (_, v) => (
          <span key={v} className="h-full flex-1" style={{ background: fill(v) }} />
        ))}
      </span>
      <span className="tabular-nums">10</span>
    </span>
  );
}

/** View 3: each biome's score out of 10 in the two large tests (contents and
 *  physics), one row per test, so weak regions stand out at a glance. Hovering
 *  a cell lights its whole column, so one biome reads across both tests. */
export default function BiomeStrip({
  ids,
  rows,
}: {
  ids: string[];
  rows: { id: string; name: string; values: number[] }[];
}) {
  return (
    <ChartHover>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] table-fixed border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th className="w-16" />
              {ids.map((id) => (
                <th key={id} className="px-0 pb-1 text-center text-[10px] font-normal tracking-tight text-mist"
                  {...tip({
                    title: LABEL[id] ?? id,
                    key: id,
                    rows: rows.map((r) => [r.name, `${r.values[ids.indexOf(id)]?.toFixed(1) ?? "–"} / 10`] as [string, string]),
                  })}>
                  {head(id)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th className="whitespace-nowrap pr-2 text-left font-normal text-mist-bright">
                  {row.name}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={ids[i]}
                    className="h-9 rounded text-center tabular-nums"
                    style={{
                      background: fill(v),
                      color: v >= 8 ? "var(--heat-ink-hi)" : v >= 6 ? "var(--heat-ink-mid)" : "var(--heat-ink-lo)",
                    }}
                    {...tip({
                      title: LABEL[ids[i]] ?? ids[i],
                      key: ids[i],
                      rows: [
                        [row.name, `${v.toFixed(1)} / 10`],
                        ...rows.filter((r) => r !== row).map((r) => [r.name, `${r.values[i].toFixed(1)} / 10`] as [string, string]),
                      ],
                    })}
                  >
                    {v.toFixed(1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartHover>
  );
}
