import { BIOME_NODES } from "@/lib/biomes";
import ChartHover from "@/components/results/ChartHover";
import { tip } from "@/components/results/tip";

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
  rows: { name: string; values: number[] }[];
}) {
  return (
    <ChartHover>
      <div className="mb-4 flex items-center gap-2 text-xs text-mist">
        <span>Points out of 10</span>
        <span className="tabular-nums">0</span>
        <span className="flex h-2.5 w-32 overflow-hidden rounded-sm">
          {Array.from({ length: 11 }, (_, v) => (
            <span key={v} className="h-full flex-1" style={{ background: fill(v) }} />
          ))}
        </span>
        <span className="tabular-nums">10</span>
      </div>

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
                <th className="whitespace-nowrap pr-2 text-left font-normal text-mist-bright">{row.name}</th>
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
    </ChartHover>
  );
}
