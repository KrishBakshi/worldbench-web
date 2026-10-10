"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TipRow } from "@/components/results/tip";

interface Tip {
  x: number;
  y: number;
  title: string;
  rows: TipRow[];
}

/**
 * The hover layer every chart shares. Wrap a chart in it and give its marks
 * `tip()` props: pointing at (or focusing) a mark shows its tooltip and dims
 * every mark outside its highlight group, so a hovered test, model or biome
 * reads across the whole chart at once.
 *
 * The tooltip is portalled to <body> with fixed positioning so the charts'
 * own `overflow-x-auto` scrollers can't clip it.
 */
export default function ChartHover({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  // The key currently lit, if any. A legend key lights a series without a
  // tooltip, so this, not `tip`, is what says a hover is in progress.
  const [lit, setLit] = useState<string | null>(null);

  const highlight = useCallback((key: string | null) => {
    setLit(key);
    ref.current?.querySelectorAll<Element>("[data-groups]").forEach((el) => {
      const on = !key || (el.getAttribute("data-groups") ?? "").split(" ").includes(key);
      el.toggleAttribute("data-dim", !on);
    });
  }, []);

  const show = useCallback(
    (target: EventTarget | null, x?: number, y?: number) => {
      const el = target instanceof Element ? target : null;
      const keyed = el?.closest("[data-key]");
      highlight(keyed && ref.current?.contains(keyed) ? keyed.getAttribute("data-key") : null);

      const marked = el?.closest("[data-tip]");
      if (!marked || !ref.current?.contains(marked)) return setTip(null);
      const box = marked.getBoundingClientRect();
      setTip({
        x: x ?? box.left + box.width / 2,
        y: y ?? box.top,
        title: marked.getAttribute("data-tip") ?? "",
        rows: JSON.parse(marked.getAttribute("data-tip-rows") ?? "[]"),
      });
    },
    [highlight],
  );

  const clear = useCallback(() => {
    highlight(null);
    setTip(null);
  }, [highlight]);

  // Scrolling moves the page under a still pointer without a pointermove, which
  // would leave the tooltip floating over the wrong mark: drop the hover instead.
  const active = tip !== null || lit !== null;
  useEffect(() => {
    if (!active) return;
    window.addEventListener("scroll", clear, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", clear, { capture: true });
  }, [active, clear]);

  // Keep the tooltip on screen: flip left of / above the pointer near the edges.
  const flipX = tip && typeof window !== "undefined" && tip.x > window.innerWidth - 240;
  const flipY = tip && tip.y < 120;

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={(e) => show(e.target, e.clientX, e.clientY)}
      onPointerLeave={clear}
      onFocus={(e) => show(e.target)}
      onBlur={clear}
    >
      {children}
      {tip &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50 min-w-36 max-w-64 rounded-md border border-line bg-void-deep px-3 py-2 text-xs shadow-lg"
            style={{
              left: tip.x,
              top: tip.y,
              transform: `translate(${flipX ? "calc(-100% - 12px)" : "12px"}, ${flipY ? "16px" : "calc(-100% - 12px)"})`,
            }}
          >
            {tip.title && <div className="mb-1 text-mist-bright">{tip.title}</div>}
            {tip.rows.map(([label, value, swatch], i) => (
              <div key={i} className="flex items-center justify-between gap-4 leading-5">
                <span className="flex min-w-0 items-center gap-1.5 text-mist">
                  {swatch && <span className="inline-block h-2 w-2 shrink-0 rounded-sm" style={{ background: swatch }} />}
                  <span className="truncate">{label}</span>
                </span>
                <span className="shrink-0 tabular-nums text-mist-bright">{value}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
