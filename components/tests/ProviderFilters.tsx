"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ProviderOption } from "@/components/tests/TestBrowser";

const GAP = 8;

function chipClass(pressed: boolean) {
  return `shrink-0 whitespace-nowrap rounded-md border px-3.5 py-1 text-xs uppercase tracking-[0.12em] transition-colors ${
    pressed
      ? "border-mist-bright bg-mist-bright text-void"
      : "border-line text-mist hover:border-mist hover:text-mist-bright"
  }`;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function Chip({
  provider,
  pressed,
  onSelect,
}: {
  provider: ProviderOption;
  pressed: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onSelect(provider.slug)}
      className={chipClass(pressed)}
    >
      {provider.name}
    </button>
  );
}

/**
 * One row of provider filter chips. Anything that doesn't fit stays off the
 * first line until the chevron is opened: then those chips wrap onto extra
 * rows underneath, same tags, and the arrow rotates so it can be clicked
 * shut again. Hover on the arrow labels it "More filters".
 */
export default function ProviderFilters({
  providers,
  active,
  onSelect,
}: {
  providers: ProviderOption[];
  active: string | null;
  onSelect: (slug: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLButtonElement>(null);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [open, setOpen] = useState(false);

  const overflow = useMemo(
    () => providers.filter((p) => hidden.has(p.slug)),
    [providers, hidden],
  );
  const visible = useMemo(
    () => providers.filter((p) => !hidden.has(p.slug)),
    [providers, hidden],
  );
  const overflowActive = active !== null && hidden.has(active);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    let cancelled = false;

    function fit() {
      if (cancelled) return;
      const measure = measureRef.current;
      const moreEl = moreMeasureRef.current;
      if (!measure || !row) return;

      const badges = Array.from(measure.children).filter(
        (el) => el !== moreEl,
      ) as HTMLElement[];
      const budget = row.clientWidth;
      let total = 0;
      for (let i = 0; i < badges.length; i++) {
        total += badges[i].offsetWidth + (i ? GAP : 0);
      }

      const next = new Set<string>();
      if (total > budget) {
        const moreW = moreEl?.offsetWidth ?? 0;
        const otherEl = badges.find((el) => el.dataset.slug === "other");
        const rest = badges.filter((el) => el.dataset.slug !== "other");
        // Keep Other on the first line (always last on that row) and wrap
        // overflowing company chips onto extra rows under the chevron.
        let reserved = moreW + GAP;
        if (otherEl) reserved += otherEl.offsetWidth + GAP;
        if (otherEl && otherEl.offsetWidth + moreW + GAP > budget) {
          next.add("other");
          reserved = moreW + GAP;
        }
        const limit = Math.max(0, budget - reserved);
        let overflowing = false;
        let used = 0;
        for (const el of rest) {
          const slug = el.dataset.slug;
          if (!slug) continue;
          const w = el.offsetWidth + (used > 0 ? GAP : 0);
          if (!overflowing && used + w <= limit) {
            used += w;
          } else {
            overflowing = true;
            next.add(slug);
          }
        }
      }

      setHidden((prev) => {
        if (prev.size === next.size && [...next].every((s) => prev.has(s))) {
          return prev;
        }
        return next;
      });
    }

    fit();
    void document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(row);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [providers]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (overflow.length === 0) setOpen(false);
  }, [overflow.length]);

  return (
    <div ref={rowRef} className="relative">
      {/* Off-screen copy used only to measure chip widths. Fixed so a long
          row can't stretch the page; visibility keeps it out of AT. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed top-0 left-0 flex gap-2 whitespace-nowrap"
      >
        {providers.map((provider) => (
          <button
            key={provider.slug}
            type="button"
            tabIndex={-1}
            data-slug={provider.slug}
            className={chipClass(false)}
          >
            {provider.name}
          </button>
        ))}
        <button
          ref={moreMeasureRef}
          type="button"
          tabIndex={-1}
          className={`${chipClass(false)} inline-flex items-center px-2`}
        >
          <Chevron open={false} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
            {visible.map((provider) => (
              <Chip
                key={provider.slug}
                provider={provider}
                pressed={active === provider.slug}
                onSelect={onSelect}
              />
            ))}
          </div>

          {overflow.length > 0 && (
            <span className="group relative shrink-0">
              <button
                type="button"
                aria-label={open ? "Show fewer filters" : "More filters"}
                aria-expanded={open}
                aria-pressed={overflowActive}
                onClick={() => setOpen((v) => !v)}
                className={`${chipClass(overflowActive || open)} inline-flex items-center px-2`}
              >
                <Chevron open={open} />
              </button>
              {!open && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute top-full right-0 z-20 mt-2 scale-95 rounded-md bg-mist-bright px-2.5 py-1 text-xs whitespace-nowrap text-void opacity-0 shadow-md transition-[opacity,transform] duration-150 group-hover:scale-100 group-hover:opacity-100 group-hover:delay-300 group-focus-within:scale-100 group-focus-within:opacity-100"
                >
                  More filters
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 right-2.5 size-2 rotate-45 rounded-[1px] bg-mist-bright"
                  />
                </span>
              )}
            </span>
          )}
        </div>

        {open && overflow.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {overflow.map((provider) => (
              <Chip
                key={provider.slug}
                provider={provider}
                pressed={active === provider.slug}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
