"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Quiet void cover over an island iframe: three mist points breathe until the
 * scene has painted, matching the PREVIEW label rather than a spinner.
 */
export function IslandVeil({ ready }: { ready: boolean }) {
  return (
    <div
      aria-hidden={ready}
      className={`absolute inset-0 z-[1] flex items-center justify-center bg-void transition-opacity duration-500 ease-out ${
        ready ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="flex items-center gap-2" aria-hidden="true">
        <span className="animate-mist-dot size-1 rounded-full bg-mist" />
        <span className="animate-mist-dot size-1 rounded-full bg-mist [animation-delay:200ms]" />
        <span className="animate-mist-dot size-1 rounded-full bg-mist [animation-delay:400ms]" />
      </span>
    </div>
  );
}

/**
 * The iframe's `load` event fires when the HTML and scripts are in, not when
 * Three.js has drawn a frame — that's the flicker. Wait for a canvas, then two
 * animation frames, so the veil lifts on a painted island. Same-origin, so the
 * document is readable; a timeout keeps a broken world from hanging forever.
 *
 * `resetKey` remounts the wait (e.g. the slug-page enlarge modal swaps the
 * iframe node).
 */
export function useIslandReady(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  src: string | null,
  resetKey: unknown = false,
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const shownAt = Date.now();
    setReady(false);

    function finish() {
      if (cancelled) return;
      const wait = Math.max(0, 400 - (Date.now() - shownAt));
      settle = setTimeout(() => {
        if (!cancelled) setReady(true);
      }, wait);
    }

    function stillBooting() {
      try {
        const doc = iframe.contentDocument;
        if (!doc?.querySelector("canvas")) return true;
        // Worlds often draw their own splash (#loading / #load) over an empty
        // canvas; wait until that overlay has gone so we fade onto the island,
        // not onto their loader.
        for (const el of doc.querySelectorAll("#loading, #loader, #load")) {
          const style = getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden") continue;
          if (parseFloat(style.opacity) > 0.05) return true;
        }
        return false;
      } catch {
        return true;
      }
    }

    function afterLoad() {
      if (cancelled) return;
      if (!stillBooting()) {
        requestAnimationFrame(() => requestAnimationFrame(finish));
        return;
      }
      const started = Date.now();
      interval = setInterval(() => {
        if (cancelled) return;
        if (!stillBooting()) {
          clearInterval(interval);
          requestAnimationFrame(() => requestAnimationFrame(finish));
        } else if (Date.now() - started > 8000) {
          clearInterval(interval);
          finish();
        }
      }, 80);
    }

    iframe.addEventListener("load", afterLoad);
    try {
      if (iframe.contentDocument?.readyState === "complete") afterLoad();
    } catch {
      // Document not reachable yet; `load` will fire.
    }

    return () => {
      cancelled = true;
      iframe.removeEventListener("load", afterLoad);
      if (interval) clearInterval(interval);
      if (settle) clearTimeout(settle);
    };
  }, [src, resetKey, iframeRef]);

  return ready;
}
