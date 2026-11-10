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
  non-model entries like the hand-tuned reference. Use `other` for anonymous
  or unbranded listings — there is no company called Stealth.
- `app/`: Next.js App Router pages: `/` (home, floating-island hero + recent
  tests), `/about` (what worldbench is), `/tests` (grid of all tests), `/leaderboard` (ranked bar plots of every
  model's scores),
  `/tests/[slug]` (intro media + the live island preview embedded in an
  iframe; "open in dedicated window" serves the untouched `world.html`).
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
   "open in dedicated window" serves.
2. `world-preview.html` — the same world with its **legends and HUD chrome
   taken out of the render**. This is what `/tests/<slug>` embeds and what
   the comparison grid loads. The detail page marks that frame as a
   preview and points to `world.html` via "open in dedicated window".

**Comparison views must never show legends.** Comparing models is a
high-level, visual judgement — is this island good? — and every world
draws its own biome list, clock, weather readout and control hints over
the scene. Four of those at once is four different UIs arguing with each
other instead of four islands next to each other. So the chrome comes off
before a world goes in the grid, always.

The preview is generated, not hand-edited, and it is two changes to a
verbatim copy of `world.html`:

1. **Chrome off.** Append one block before `</body>` that comments the
   overlay out of the render, listing that world's own top-level overlay
   ids. Leave loading indicators alone — they remove themselves once the
   scene is up.
2. **Sun pinned.** Every world derives its sun from a single line: an angle
   computed from its clock (`const ang = (time / DAY) * Math.PI * 2`, or
   that idea in the model's own spelling). Replace the right-hand side with
   `1.1`. In all of them elevation is `sin(angle)`, so 1.1 rad puts the sun
   high and a little to the side, late morning. Mark the edit with a comment
   naming it a preview pin.

Pin the angle, never the clock. The clock also drives weather, seasons,
water, wind and creatures, and freezing it stops the world dead; a preview
is meant to be a live island under fixed light, not a photograph. One
world needs the pin twice (`ox-alpha` uses the same expression again for
its zone update); one has no usable angle (`deepseek-v4-flash` orbits the
sun by azimuth only) and instead takes a constant where its
`updateSunPosition(time)` call passes the clock.

The cost of pinning is that nocturnal content never appears in a preview:
fireflies, lanterns, bioluminescence, animals that only come out after
dark. That is the trade. The grid asks whether an island is good at a
glance, and `world.html` still runs the full cycle behind "open in
dedicated window".

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
- The header has exactly four links: Home, About, Evaluations
  (`/tests`), and Leaderboard. Don't add more without being asked.
- Prefix every commit subject with its kind: `Add:` for new files or
  features, `Update:` for changes to something that already works, `Fix:`
  for corrections, `Remove:` for deletions, `Refactor:` for behaviour-neutral
  restructuring, `Docs:` for prose-only edits. Keep the rest of the subject
  imperative and short (`Add: Opus 5 test metadata`), with the detail in the
  body.
- **A model's bench branch carries that model's scores and nothing else.**
  Branch `bench/<slug>` from `origin/main`. Its commit adds
  `public/tests/<slug>/results.json` plus that one model's row in
  `public/leaderboard.json`. Never stack one model's bench branch on another
  model's, and never put a pending model's results or leaderboard row on
  another model's branch. `export_to_web.py` rewrites the leaderboard with every
  exported model, so if another model's scores are still unmerged, drop its row
  before committing. If two bench branches both edit the one-line
  `leaderboard.json`, that conflict gets resolved when the second one merges.
  It is not a reason to combine the two. (A Gemini 3.8 Flash branch was once
  stacked on the Muse Wonder branch to avoid that conflict, so the Gemini PR
  shipped Muse Wonder's scores too.)
- **Adding a model is two branches in two repos, both `bench/<slug>`** (slug
  is the folder name, e.g. `claude-fable-5-2`, not the display name).
  1. Here: branch from `origin/main`; commit `public/tests/<slug>/` (`meta.mdx`,
     `world.html`, generated `world-preview.html`) as `Add: <Model> test`.
  2. `../worldbench`: branch from `origin/main`, copy `world.html` to
     `inputs/<slug>/world.html`, run `uv run python -m eval.run <slug>`, then
     `uv run python -m eval.gaps find <slug>` (repair until clean). Commit
     `outputs/<slug>/` alone as `add: <slug> scored outputs (<score>/280)`.
  3. Back here: `uv run python scripts/export_to_web.py <slug>` (run from
     `../worldbench`), then keep only this model's `results.json` and
     leaderboard row (see the rule above) and commit `Add: <Model> scores`.
  4. Push either branch only when the run is genuine: no failed checks,
     crashed capture, judge outages or unfinished rechecks, and `eval.gaps`
     clean. Never push a partial or failing run, and never hand-edit scores.
- Keep `README.md` current. When a major commit is requested — a new page,
  a user-facing feature, or a change to the test frontmatter / folder
  layout — check whether the README still describes things accurately and
  update it in the same batch of work. Skip it for minor or internal-only
  changes.
