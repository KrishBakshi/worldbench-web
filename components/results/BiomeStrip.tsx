import { BIOME_NODES } from "@/lib/biomes";

const LABEL = Object.fromEntries(BIOME_NODES.map((n) => [n.id, n.label]));
/** Column heads: the biome id ("mountains"), capitalised; the full label is the tooltip. */
const head = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

/** View 3: each biome's score out of 10 in the two large tests (contents and
 *  physics), one row per test, so weak regions stand out at a glance. */
export default function BiomeStrip({
  ids,
  rows,
}: {
  ids: string[];
  rows: { name: string; values: number[] }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] table-fixed border-separate border-spacing-1 text-xs">
        <thead>
          <tr>
            <th className="w-16" />
            {ids.map((id) => (
              <th key={id} className="px-0 pb-1 text-center text-[10px] font-normal tracking-tight text-mist" title={LABEL[id] ?? id}>
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
                    background: `color-mix(in oklab, var(--color-glow) ${Math.round(v * 9)}%, var(--color-void-deep))`,
                    color: v >= 6 ? "var(--color-void-deep)" : "var(--color-mist-bright)",
                  }}
                  title={`${LABEL[ids[i]] ?? ids[i]}: ${v} / 10`}
                >
                  {v.toFixed(1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
