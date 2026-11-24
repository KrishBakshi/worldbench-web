---
name: add-model-test
description: Add a new model's test folder (meta.mdx + world-preview.html) to public/tests/<slug>/ and push a bench branch. Use when a new world.html has been dropped into public/tests/<slug>/.
---

1. `git fetch origin && git checkout -b bench/<slug> origin/main` (untracked `world.html` carries over). Never stack on another model's branch.
2. Write `meta.mdx` modelled on a sibling (`title`, `model`, `provider`, `date`, `pinned: false`).
3. Generate `world-preview.html` = verbatim `world.html` plus: (a) the sun-angle line (e.g. `const dayAngle = <clock expr>`) replaced by `1.1` with a "preview pin" comment; (b) before `</body>`, a `<style>` hiding the HUD/legend ids with `display:none !important`. Hide, never delete, the markup. Pin the angle, not the clock.
4. Commit `Add: <Model> test` (see CLAUDE.md), push with `-u`. Scores live on a separate branch.
