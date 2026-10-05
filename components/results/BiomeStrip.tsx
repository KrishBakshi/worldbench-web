import { BIOME_NODES } from "@/lib/biomes";
import ChartHover from "@/components/results/ChartHover";
import { tip } from "@/components/results/tip";
import { testColor } from "@/components/results/series";

const LABEL = Object.fromEntries(BIOME_NODES.map((n) => [n.id, n.label]));
/** Column heads: the biome id ("mountains"), capitalised; the full label is the tooltip. */
const head = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
/** Cell fill: the accent mixed into the page in proportion to the score. */
const fill = (v: number) => `color-mix(in oklab, var(--color-glow) ${Math.round(v * 9)}%, var(--color-void-deep))`;

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
              <th className="w-20" />
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
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-sm" style={{ background: testColor(row.id) }} />
                  {row.name}
                </th>
                {row.values.map((v, i) => (
                  <td
                    key={ids[i]}
                    className="h-9 rounded text-center tabular-nums"
                    style={{
                      background: fill(v),
                      color: v >= 6 ? "var(--color-void-deep)" : "var(--color-mist-bright)",
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

      {/* Colour key. Every cell prints its value, so the key is reference
          rather than a way in: it sits after the grid, flush with its right
          edge (pr-1 matches the table's border spacing). The block's note
          already names the units. */}
      <div className="mt-3 flex items-center justify-end gap-2 pr-1 text-xs text-mist" aria-label="Colour scale, 0 to 10 points">
        <span className="tabular-nums">0</span>
        <span className="flex h-2.5 w-32 overflow-hidden rounded-sm">
          {Array.from({ length: 11 }, (_, v) => (
            <span key={v} className="h-full flex-1" style={{ background: fill(v) }} />
          ))}
        </span>
        <span className="tabular-nums">10</span>
      </div>
    </ChartHover>
  );
}
