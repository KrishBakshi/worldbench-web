"use client";

import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getProvider } from "@/lib/providers";
import {
  WORDMARK_SIZE,
  getProviderIcon,
  getProviderWordmark,
  wordmarkSize,
} from "@/components/icons";

/**
 * A test reduced to what the comparison grid needs: enough to label a panel and
 * point an iframe at a world. The detail page is a server component, so the full
 * Test objects (which carry MDX bodies) never have to cross into the client.
 */
export interface CompareEntry {
  slug: string;
  title: string;
  model: string;
  provider: string | null;
  /** The legend-free build — see "Preview builds" in CLAUDE.md. */
  worldPreviewSrc: string;
}

/**
 * How many worlds can be on screen at once. Each panel is a live Three.js scene
 * with its own WebGL context, and browsers cap those per page (~16 in Chrome,
 * fewer in Safari) — past six the earliest contexts start getting dropped, so
 * the grid stops offering to add more rather than quietly killing a panel.
 */
const MAX_PANELS = 6;

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "h-3.5 w-3.5"}
    >
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-mist"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** The model name plus its company wordmark, as it appears on a panel's header. */
function PanelLabel({ entry }: { entry: CompareEntry }) {
  const wordmark = getProviderWordmark(entry.provider);
  const provider = getProvider(entry.provider);

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="truncate text-xs text-mist-bright">{entry.model}</span>
      {wordmark ? (
        createElement(wordmark, {
          size: wordmarkSize(entry.provider, WORDMARK_SIZE.cardCompact),
          role: "img",
          "aria-label": provider?.name ?? "",
          className: "shrink-0 text-mist",
        })
      ) : provider ? (
        <span className="shrink-0 text-[10px] text-mist">{provider.name}</span>
      ) : null}
    </div>
  );
}

/** One world in the grid: its label, a live frame, and (past the first) a remove. */
function ComparePanel({
  entry,
  onRemove,
}: {
  entry: CompareEntry;
  onRemove: (() => void) | null;
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-void">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2">
        <PanelLabel entry={entry} />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${entry.model} from the comparison`}
            className="shrink-0 text-mist transition-colors hover:text-mist-bright"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <iframe
        src={entry.worldPreviewSrc}
        title={`${entry.title} world`}
        className="min-h-0 w-full flex-1"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

/**
 * The empty slot beside the first world. On opening there is nothing to compare
 * against yet, so the invitation is panel-sized and sits where the second world
 * will land.
 */
function AddPanel({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Add a model (⌘K)"
      className="group flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line text-mist transition-colors hover:border-mist hover:text-mist-bright"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors group-hover:border-mist">
        <PlusIcon className="h-5 w-5" />
      </span>
      <span className="text-[11px] uppercase tracking-[0.15em]">Add model</span>
    </button>
  );
}

/**
 * The add control once the comparison is running: same job as AddPanel, kept
 * small and under the worlds so it takes room from them rather than standing in
 * for one of them.
 */
function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Add a model (⌘K)"
      className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-dashed border-line px-3 text-mist transition-colors hover:border-mist hover:text-mist-bright"
    >
      <PlusIcon className="h-4 w-4" />
      <span className="text-[10px] uppercase tracking-[0.15em]">Add model</span>
    </button>
  );
}

/**
 * Command-palette picker: type to narrow, arrows to move, Enter to add. Opens
 * from the add button or ⌘K / Ctrl+K anywhere in the dialog.
 */
function ModelPicker({
  options,
  onPick,
  onClose,
}: {
  options: CompareEntry[];
  onPick: (entry: CompareEntry) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => {
      const provider = getProvider(option.provider)?.name ?? "";
      return `${option.model} ${option.title} ${provider}`.toLowerCase().includes(needle);
    });
  }, [options, query]);

  // A narrowed list can be shorter than the cursor was, so pull it back in range.
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  // Keep the highlighted row visible while arrowing past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, results.length]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((current) => {
        if (results.length === 0) return 0;
        const next = Math.min(current, results.length - 1) + step;
        return (next + results.length) % results.length;
      });
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const chosen = results[activeIndex];
      if (chosen) onPick(chosen);
    }
  }

  return (
    <div
      onClick={onClose}
      className="animate-backdrop-fade absolute inset-0 z-10 flex items-start justify-center bg-void-deep/70 p-4 pt-[12vh] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="animate-modal-pop flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-lg border border-line bg-void shadow-2xl"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-line px-4">
          <SearchIcon />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search models…"
            aria-label="Search models"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-mist-bright placeholder:text-mist focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-mist">
            esc
          </kbd>
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-6 text-sm text-mist">
            {options.length === 0
              ? "Every test is already in the comparison."
              : `No model matches “${query.trim()}”.`}
          </p>
        ) : (
          <ul ref={listRef} className="min-h-0 overflow-y-auto py-1">
            {results.map((option, index) => {
              const icon = getProviderIcon(option.provider);
              const isActive = index === activeIndex;
              return (
                <li key={option.slug}>
                  <button
                    type="button"
                    data-active={isActive}
                    onClick={() => onPick(option)}
                    onMouseMove={() => setActive(index)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isActive ? "bg-line/60" : ""
                    }`}
                  >
                    {icon ? (
                      createElement(icon, {
                        "aria-hidden": true,
                        className: "h-4 w-4 shrink-0 text-mist",
                      })
                    ) : (
                      <span className="h-4 w-4 shrink-0" />
                    )}
                    <PanelLabel entry={option} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Side-by-side comparison of this test's world against any of the others. Opens
 * from the row under the embedded world; the grid starts with the test being
 * viewed and grows a panel at a time from the picker.
 */
export default function CompareModels({
  current,
  entries,
}: {
  current: CompareEntry;
  entries: CompareEntry[];
}) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [panels, setPanels] = useState<CompareEntry[]>([current]);
  const gridRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setPicking(false);
  }, []);

  const chosen = new Set(panels.map((panel) => panel.slug));
  const options = entries.filter((entry) => !chosen.has(entry.slug));
  const canAdd = panels.length < MAX_PANELS && options.length > 0;
  // The grid is two columns wide, so an odd number of worlds leaves the last
  // row half empty and the slot has somewhere to sit inside the grid.
  const hasFreeCell = panels.length % 2 === 1;

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      // ⌘K / Ctrl+K opens the picker from anywhere in the dialog. Only bound
      // while the dialog is open, so the page keeps the shortcut otherwise.
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (canAdd) setPicking(true);
        return;
      }
      if (e.key !== "Escape") return;
      // The picker sits over the grid, so Escape backs out one layer at a time.
      setPicking((wasPicking) => {
        if (!wasPicking) setOpen(false);
        return false;
      });
    }
    window.addEventListener("keydown", onKeyDown);

    // Once someone drags a world to orbit it, keyboard focus is inside that
    // iframe and the keydown lands on its document, not ours. The worlds are
    // same-origin, so listen in each of them too — same trick as WorldEmbed,
    // repeated per panel. Frames are re-scanned whenever the panel list changes.
    const frames = Array.from(gridRef.current?.querySelectorAll("iframe") ?? []);
    const attached: Window[] = [];

    function attach(frame: HTMLIFrameElement) {
      try {
        const inner = frame.contentWindow;
        if (!inner) return;
        inner.addEventListener("keydown", onKeyDown);
        attached.push(inner);
      } catch {
        // frame not reachable; the window listener still covers the page
      }
    }

    for (const frame of frames) {
      attach(frame);
      // A world is usually still loading when it mounts, and contentWindow is
      // replaced on load, so re-attach once it settles.
      frame.addEventListener("load", () => attach(frame));
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      for (const inner of attached) {
        try {
          inner.removeEventListener("keydown", onKeyDown);
        } catch {
          // frame already gone; nothing to detach
        }
      }
    };
  }, [open, canAdd, panels]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-mist-bright"
      >
        <GridIcon />
        <span className="underline underline-offset-2">Compare models</span>
      </button>

      {open && (
        <div
          onClick={close}
          className="animate-backdrop-fade fixed inset-0 z-50 flex items-center justify-center bg-void/20 p-4 backdrop-blur-sm sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-pop relative flex h-[80vh] w-full flex-col overflow-hidden rounded-lg border border-line bg-void shadow-2xl sm:w-[80vw]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-4 py-3">
              <h2 className="font-display text-sm text-mist-bright">Compare models</h2>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.15em] text-mist tabular-nums">
                  {panels.length} / {MAX_PANELS}
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="text-mist transition-colors hover:text-mist-bright"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto p-4">
              {/* The grid takes the whole height between the header and the add
                  button, so the worlds sit centred in the dialog: one world fills
                  the row beside the empty slot, a pair splits it evenly. One
                  column on phones, two from `sm` up. */}
              <div
                ref={gridRef}
                className="grid min-h-0 w-full flex-1 auto-rows-[minmax(12rem,1fr)] grid-cols-1 gap-4 sm:auto-rows-fr sm:grid-cols-2"
              >
                {panels.map((panel, index) => (
                  <ComparePanel
                    key={panel.slug}
                    entry={panel}
                    // The test being viewed anchors the comparison and stays put.
                    onRemove={
                      index === 0
                        ? null
                        : () =>
                            setPanels((current) =>
                              current.filter((p) => p.slug !== panel.slug),
                            )
                    }
                  />
                ))}
                {/* An odd count leaves a cell free on the last row — that gap is
                    where the next world goes, so the slot fills it. */}
                {canAdd && hasFreeCell && <AddPanel onClick={() => setPicking(true)} />}
              </div>
              {/* An even count fills the rows, so the slot drops below as a small
                  button rather than opening a row of its own and shrinking every
                  world to make space for an empty tile. */}
              {canAdd && !hasFreeCell && <AddButton onClick={() => setPicking(true)} />}
            </div>

            {picking && (
              <ModelPicker
                options={options}
                onPick={(entry) => {
                  setPanels((current) => [...current, entry]);
                  setPicking(false);
                }}
                onClose={() => setPicking(false)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
