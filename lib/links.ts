/**
 * Everywhere worldbench lives outside this site. One list, so the home page's
 * reference row, the header's GitHub mark and the About page's citation all
 * point at the same URLs.
 */
export const ARXIV_ID = "2610.10622";

export const LINKS = {
  paper: `https://arxiv.org/abs/${ARXIV_ID}`,
  pdf: `https://arxiv.org/pdf/${ARXIV_ID}`,
  code: "https://github.com/KrishBakshi/worldbench",
  dataset: "https://huggingface.co/datasets/KrishBakshi/worldbench",
  space: "https://huggingface.co/spaces/KrishBakshi/worldbench",
} as const;

export const PAPER_TITLE = "WorldBench: Evaluating LLMs on Three.js Voxel World Generation";

export const BIBTEX = `@article{bakshi2026worldbench,
  title   = {${PAPER_TITLE}},
  author  = {Bakshi, Krish},
  journal = {arXiv preprint arXiv:${ARXIV_ID}},
  year    = {2026}
}`;
