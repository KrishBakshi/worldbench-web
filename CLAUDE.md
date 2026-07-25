# worldbench: repo guide for Claude

This repo is the **worldbench** site: a Next.js (App Router) + TypeScript +
React, front-end-only portfolio for a single prompt. `prompts/prompt.md`
asks a model to generate a self-contained Three.js `world.html` of a floating
biome island directly (no JSON intermediate, no schema, no scoring). The
site lets people browse and interact with `world.html` outputs from
different models, compared visually.

**Models never see reference files.** Only `prompts/prompt.md` is
model-facing. `outputs/create.html` is a hand-tuned ideal world for humans,
used to judge results and to distill ecological / relational intent back
into that prompt. Never bake absolute dimensions, coordinates, or "copy
this file" language into the model-facing text.

## Layout
- `prompts/prompt.md`: the only model-facing prompt (copy-paste as-is).
- `prompts/README.md`: human notes for that prompt.
- `outputs/create.html`: ideal-world reference (human / qualitative only).
- `public/prompt.md`: a copy of `prompts/prompt.md`, served statically so
  the site can fetch/display it.
- `public/about/meta.mdx`: content for the About page (what worldbench is
  and the reasoning it tests), plus `public/about/island-info.png` (biome
  legend image, rendered on that page alongside a hand-built placement
  graph in `components/about/BiomeGraph.tsx`).
- `public/tests/<slug>/`: the site's content model. Each folder is one
  test: `meta.mdx` (frontmatter: `title`, `model`, `provider`, `date`,
  `pinned`, plus optional `summary`, `xPost`, and a notes body), an optional
  `intro.mp4` / `intro.webm` / `intro.gif`, and two builds of the output —
  `world.html` and `world-preview.html` (see **Preview builds** below).
  Adding a new test is just adding a new folder, no code changes
  needed. `pinned: true` tests (up to 4, most recent first) show on the home
  page under "See Recent Tests"; all tests show on `/tests`. `provider` keys
  into `lib/providers.ts` for the company name, and into
  `components/icons/index.ts` for two vendored marks: the model logo drawn as
  the card watermark, and the company wordmark (`*-text.tsx`) set as type
  under the model name on both the card and the detail page. Leave it out for
  non-model entries like the hand-tuned reference.
- `app/`: Next.js App Router pages: `/` (home, floating-island hero + recent
  tests), `/about` (what worldbench is), `/tests` (grid of all tests),
  `/tests/[slug]` (intro media + the live `world.html` embedded in an
  iframe).
- `components/`, `lib/tests.ts`, `lib/about.ts`: site code; the `lib/*.ts`
  files are the filesystem-based loaders for `public/tests/` and
  `public/about/`.
- `old/`: gitignored, local-only archive of the prior benchmark-era work
  (validators, schema, scored outputs, prior prompt pipeline). Not part of
  the live project; kept for reference only. It is also the source of the
  current seed tests in `public/tests/` (copied out, not itself shipped).

## Preview builds

Every test ships its world twice:

1. `world.html` — the model's raw output, untouched. This is what
   `/tests/<slug>` embeds and what "open in dedicated window" serves.
2. `world-preview.html` — the same world with its **legends and HUD chrome
   taken out of the render**. This is the only thing the comparison grid
   loads.

**Comparison views must never show legends.** Comparing models is a
high-level, visual judgement — is this island good? — and every world
draws its own biome list, clock, weather readout and control hints over
the scene. Four of those at once is four different UIs arguing with each
other instead of four islands next to each other. So the chrome comes off
before a world goes in the grid, always.

The preview is generated, not hand-edited: copy `world.html` verbatim and
append one block before `</body>` that comments the overlay out of the
render, listing that world's own top-level overlay ids. Leave loading
indicators alone — they remove themselves once the scene is up.

Hide the overlay rather than deleting its markup. Most of these worlds
populate their legend from script (`getElementById('legend').innerHTML =
…`); cut the element and that lookup returns null, the script throws
part-way through setup, and the panel goes black. The element has to stay
in the document for the world to keep running — what gets removed is the
display.

When adding a test, generate its preview in the same batch. A folder with
no `world-preview.html` still works — `lib/tests.ts` falls back to
`world.html` — but it falls back to a world with legends, which is the
thing the grid exists to avoid.

## Conventions
- Front-end only: no backend, no database, no API routes. `npm install &&
  npm run dev` to run it.
- Keep the home page minimal and sparse: no extra copy over the floating
  island animation beyond the header and "See Recent Tests".
- The header has exactly three links: Home, About, and View Tests. Don't
  add more without being asked.
- Prefix every commit subject with its kind: `Add:` for new files or
  features, `Update:` for changes to something that already works, `Fix:`
  for corrections, `Remove:` for deletions, `Refactor:` for behaviour-neutral
  restructuring, `Docs:` for prose-only edits. Keep the rest of the subject
  imperative and short (`Add: Opus 5 test metadata`), with the detail in the
  body.
- Keep `README.md` current. When a major commit is requested — a new page,
  a user-facing feature, or a change to the test frontmatter / folder
  layout — check whether the README still describes things accurately and
  update it in the same batch of work. Skip it for minor or internal-only
  changes.
