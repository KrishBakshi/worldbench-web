---
name: score-model
description: Finish a model's bench branch here after worldbench scoring: keep only its results.json and leaderboard row, commit, push. Pairs with the score-model skill in ../worldbench.
---

1. Score in `../worldbench` first (its `score-model` skill); it must be a clean, genuine run.
2. Its `export_to_web.py <slug>` writes `public/tests/<slug>/results.json` and rewrites `public/leaderboard.json` here.
3. Stay on `bench/<slug>` (from origin/main, not another model's branch). Drop any other unmerged model's row from `leaderboard.json`; keep only this model's.
4. Commit `Add: <Model> scores`; push `-u`. Don't push a partial or failing run.
