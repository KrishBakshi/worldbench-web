import type { ModelResults } from "@/lib/results";
import ScoreProfile from "@/components/results/ScoreProfile";
import BiomeStrip from "@/components/results/BiomeStrip";
import PlacementGraph from "@/components/results/PlacementGraph";

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <h3 className="text-sm text-mist-bright">{title}</h3>
      {note && <p className="mt-0.5 text-xs text-mist">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** A model's scores: the profile (polygon + bars), per-biome strip, and placement. */
export default function ResultsPanel({ results }: { results: ModelResults }) {
  const name = (id: string) => results.tests.find((t) => t.id === id)?.name ?? "";
  const short = (id: string) => results.tests.find((t) => t.id === id)?.short ?? "";
  const b = results.biomes;
  const rows = b
    ? (["WC003", "WC004"] as const)
        .filter((id) => b[id])
        .map((id) => ({ name: short(id), values: b[id] as number[] }))
    : [];

  return (
    <section className="mt-10 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg text-mist-bright">Scores</h2>
        <span className="tabular-nums text-sm text-mist">
          <span className="text-mist-bright">{results.total.score}</span> / {results.total.max}
          {!results.complete && " · partial"}
        </span>
      </div>

      <Block title="Score profile" note="Each test as a share of its maximum.">
        <ScoreProfile tests={results.tests} />
      </Block>

      {rows.length > 0 && b && (
        <Block title="By biome" note="Points out of 10 per biome in the two largest tests.">
          <BiomeStrip ids={b.ids} rows={rows} />
        </Block>
      )}

      {results.placement && (
        <Block title={name("WC002")} note="Only the links the prompt's rules mention are drawn.">
          <PlacementGraph data={results.placement} />
        </Block>
      )}
    </section>
  );
}
