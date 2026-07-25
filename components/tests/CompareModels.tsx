"use client";

import { createElement, useCallback, useEffect, useState } from "react";
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
  worldHtmlSrc: string;
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
        src={entry.worldHtmlSrc}
        title={`${entry.title} world.html`}
        className="min-h-0 w-full flex-1"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

/**
 * The empty slot that ends the grid. Sized like a panel so the grid reads as
 * having one more place to fill rather than a button bolted underneath.
 */
function AddPanel({ onClick, span }: { onClick: () => void; span: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add a model to the comparison"
      className={`group flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line text-mist transition-colors hover:border-mist hover:text-mist-bright ${
        span ? "sm:col-span-2" : ""
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition-colors group-hover:border-mist">
        <PlusIcon className="h-4 w-4" />
      </span>
      <span className="text-[10px] uppercase tracking-[0.15em]">Add model</span>
    </button>
  );
}

/** The picker that opens over the grid when an empty slot is clicked. */
function ModelPicker({
  options,
  onPick,
  onClose,
}: {
  options: CompareEntry[];
  onPick: (entry: CompareEntry) => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="animate-backdrop-fade absolute inset-0 z-10 flex items-center justify-center bg-void-deep/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-modal-pop flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-lg border border-line bg-void shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-mist">
            Add a model
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-mist transition-colors hover:text-mist-bright"
          >
            <CloseIcon />
          </button>
        </div>

        {options.length === 0 ? (
          <p className="px-4 py-6 text-sm text-mist">
            Every test is already in the comparison.
          </p>
        ) : (
          <ul className="min-h-0 overflow-y-auto py-1">
            {options.map((option) => {
              const icon = getProviderIcon(option.provider);
              return (
                <li key={option.slug}>
                  <button
                    type="button"
                    onClick={() => onPick(option)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-line/60"
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

  const close = useCallback(() => {
    setOpen(false);
    setPicking(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // The picker sits over the grid, so Escape backs out one layer at a time.
      setPicking((wasPicking) => {
        if (!wasPicking) setOpen(false);
        return false;
      });
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const chosen = new Set(panels.map((panel) => panel.slug));
  const options = entries.filter((entry) => !chosen.has(entry.slug));
  const canAdd = panels.length < MAX_PANELS && options.length > 0;

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

            {/* One column on phones, two from `sm` up. Rows are sized so two fill
                the height and a third starts to scroll, which keeps every panel
                large enough to actually read the world inside it. */}
            <div className="grid min-h-0 flex-1 auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 overflow-y-auto p-4 sm:auto-rows-[minmax(14rem,calc(50%-0.5rem))] sm:grid-cols-2">
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
              {canAdd && (
                <AddPanel
                  onClick={() => setPicking(true)}
                  // An even count leaves the slot alone on a fresh row, where a
                  // half-width tile would look like a panel that failed to load.
                  span={panels.length % 2 === 0}
                />
              )}
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
