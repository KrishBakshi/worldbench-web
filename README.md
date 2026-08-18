<p align="center">
  <img src="public/world.png" alt="WorldBench: a generated floating natural world" width="612">
</p>

# worldbench

A single prompt for generating a self-contained Three.js `world.html` of a
floating biome island, plus a small site for browsing and interacting with
what different models produce from it.

An automated ladder scores structure and ecology. You still look at what
each model built; a score cannot see whether the place feels right.

The model only ever sees the natural-language prompt. It is never shown
[`outputs/create.html`](outputs/create.html). That file is a hand-tuned
**ideal world** for humans: a qualitative target when judging outputs and
when refining the prompt. Models invent their own scale and layout; a
result can differ or be better if the ecological relationships and climate
logic hold.

## Running the site

```bash
npm install
npm run dev
```

Four pages:
- **Home**: a minimal floating-island animation, then "See Recent Tests"
  (up to 4 pinned tests).
- **About**: what worldbench is, the reasoning it tests, the biome legend
  image, and a placement graph of how the biomes relate to each other.
- **View Tests**: a grid of every test, searchable by name, model, or
  provider and filterable by provider badge, each card opening into its own
  page with an intro clip, the test date, and the live, interactive
  `world.html` embedded below it. Under that world, **Compare models**
  opens a grid that puts it side by side with the worlds from up to five
  other tests, added one panel at a time. If the test has a ladder export,
  a score ladder sits under the world.
- **Leaderboard**: ranked ladder scores for each model, with a chart and a
  per-test breakdown from voxel lattice through temporal cycles.

## Adding a test

Drop a new folder in `public/tests/<slug>/` with:
- `meta.mdx`: frontmatter (`title`, `model`, `provider`, `date`, `pinned`,
  plus optional `summary`, `xPost`) followed by optional notes. `provider`
  keys into the company name and logo; leave it out for non-model entries
  like the hand-tuned reference.
- `world.html`: the model's raw output
- `world-preview.html`: the same world with its legend / HUD overlays
  commented out of the render, which is what the comparison grid loads.
  Comparing islands side by side means comparing islands, not four
  different HUDs at once.
- optionally `intro.mp4` / `intro.webm` / `intro.gif`
- optionally `scores.json` and `graph.json` from a ladder export

No code changes needed, the site reads `public/tests/` at build time.

## Using the prompt yourself

1. Open [`prompts/prompt.md`](prompts/prompt.md) (see also
   [`prompts/README.md`](prompts/README.md)).
2. Copy the entire file and paste it into a model.
3. Save the raw output (no surrounding prose) as `world.html`.
4. Open it in a browser and look around.
5. Optionally open `outputs/create.html` yourself as a qualitative reference.
6. Repeat with other models and compare the results side by side.
