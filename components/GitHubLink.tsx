"use client";

import { useEffect, useState } from "react";
import GitHubIcon from "@/components/icons/github";
import { LINKS } from "@/lib/links";

const REPO_API = "https://api.github.com/repos/KrishBakshi/worldbench";
const CACHE_KEY = "worldbench-stars";
/** How long a fetched count is reused before asking GitHub again. The
 *  unauthenticated API allows 60 requests an hour per visitor, so every page
 *  view refetching would run out quickly for anyone browsing a while. */
const CACHE_MS = 10 * 60 * 1000;

/** 1234 -> "1.2k", so the badge stays narrow as the count grows. */
function formatCount(n: number) {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "")}k`;
}

function readCache(): number | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { count, at } = JSON.parse(raw);
    return typeof count === "number" && Date.now() - at < CACHE_MS ? count : null;
  } catch {
    return null;
  }
}

/**
 * Header link to the project repository, with its live GitHub star count. The
 * count is fetched client-side (the site has no backend) and cached for the
 * session; until it arrives, or if GitHub can't be reached, the link shows the
 * mark alone at the same 8x8 hit area as the theme toggle beside it.
 */
export default function GitHubLink() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const cached = readCache();
    const count: Promise<number | null> =
      cached !== null
        ? Promise.resolve(cached)
        : fetch(REPO_API, { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              const n = data?.stargazers_count;
              if (typeof n !== "number") return null;
              try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify({ count: n, at: Date.now() }));
              } catch {}
              return n;
            });
    count
      .then((n) => {
        if (n !== null && !controller.signal.aborted) setStars(n);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <a
      href={LINKS.code}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        stars === null
          ? "View the worldbench repository on GitHub"
          : `View the worldbench repository on GitHub, ${stars} stars`
      }
      className="flex h-8 min-w-8 items-center justify-center gap-1.5 px-1 text-mist-bright transition-opacity hover:opacity-70"
    >
      <GitHubIcon width={18} height={18} aria-hidden="true" />
      {stars !== null && (
        <span aria-hidden="true" className="flex items-center gap-1 font-display text-xs tabular-nums text-mist">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
            <path d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z" />
          </svg>
          {formatCount(stars)}
        </span>
      )}
    </a>
  );
}
