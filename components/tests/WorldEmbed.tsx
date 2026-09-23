"use client";

import { useEffect, useId, useRef, useState } from "react";
import MissingWorldBanner from "@/components/tests/MissingWorldBanner";
import { IslandVeil, useIslandReady } from "@/components/tests/IslandVeil";

function ExpandIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function DedicatedLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-mist underline-offset-2 transition-colors hover:text-mist-bright hover:underline"
    >
      Open in dedicated window
      <ExternalLinkIcon />
    </a>
  );
}

/**
 * The line under the on-page island: this frame is the preview build, with its
 * chrome hidden and its sun pinned, and the original generation lives behind
 * "Open in dedicated window". The (i) discloses both of those, so nobody reads
 * a fixed morning as the model's own choice. Same info-mark as the header
 * wordmark, click rather than hover so the copy can wrap.
 */
function PreviewNote({ dedicatedSrc }: { dedicatedSrc: string }) {
  const [open, setOpen] = useState(false);
  const noteId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="mt-2">
      <div className="flex items-center gap-2">
        {/* Mark and label are one control: the word is what people aim at, and
            a lone (i) beside inert text reads as two separate things when it is
            one affordance. Colour lives on the button so the icon, which draws
            in currentColor, lights with the label. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={noteId}
          aria-label="About this preview"
          onClick={() => setOpen((v) => !v)}
          className="flex cursor-help items-center gap-2 text-mist transition-colors hover:text-mist-bright focus-visible:text-mist-bright focus-visible:outline-none"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full">
            <InfoIcon />
          </span>
          <span className="text-[10px] tracking-[0.15em] uppercase">
            Preview
          </span>
        </button>
        <span className="ml-auto">
          <DedicatedLink href={dedicatedSrc} />
        </span>
      </div>
      {open && (
        <p
          id={noteId}
          className="mt-2 max-w-xl text-xs leading-relaxed text-mist"
        >
          This is a preview of the original generation, built for comparing
          islands: its legend and HUD chrome are hidden, and its day/night cycle
          is pinned to late morning so every model is seen under the same light.
          Everything else runs as the model wrote it. The original, with its
          legend, clock, weather readout and full day/night cycle, opens under{" "}
          {/* Set as the tag it names: the same small-caps label as the control
              in the row above, so the sentence points at a thing on screen
              rather than describing one. */}
          <a
            href={dedicatedSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded border border-line px-1.5 py-0.5 align-baseline text-[10px] tracking-[0.15em] text-mist-bright uppercase transition-colors hover:border-mist hover:text-mist-bright"
          >
            Open in dedicated window
          </a>
          .
        </p>
      )}
    </div>
  );
}

export default function WorldEmbed({
  src,
  dedicatedSrc,
}: {
  /** Legend-free preview, shown in the on-page frame. Null if the file is missing. */
  src: string | null;
  /** Untouched world.html, opened by "Open in dedicated window". */
  dedicatedSrc: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isPreview = Boolean(src && dedicatedSrc && src !== dedicatedSrc);
  const ready = useIslandReady(iframeRef, src, expanded);

  useEffect(() => {
    if (!expanded || !src) return;

    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKeyDown);

    // Once the user clicks into the 3D world, keyboard focus is inside the
    // iframe and Escape fires on its document, not ours — so the window listener
    // alone misses it. world.html is same-origin, so also listen in there. The
    // load handler re-attaches if the frame reloads; try/catch guards the rare
    // case the document isn't reachable.
    const iframe = iframeRef.current;
    let innerWindow: Window | null = null;

    function attachToFrame() {
      try {
        innerWindow?.removeEventListener("keydown", onKeyDown);
        innerWindow = iframe?.contentWindow ?? null;
        innerWindow?.addEventListener("keydown", onKeyDown);
      } catch {
        innerWindow = null;
      }
    }

    attachToFrame();
    iframe?.addEventListener("load", attachToFrame);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      iframe?.removeEventListener("load", attachToFrame);
      try {
        innerWindow?.removeEventListener("keydown", onKeyDown);
      } catch {
        // frame already gone; nothing to detach
      }
    };
  }, [expanded, src]);

  if (!src) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative aspect-video overflow-hidden rounded-lg border border-line">
          <MissingWorldBanner />
        </div>
      </div>
    );
  }

  const iframe = (
    <iframe
      ref={iframeRef}
      src={src}
      title={isPreview ? "Island preview" : "Island"}
      className="w-full flex-1"
      loading="lazy"
      sandbox="allow-scripts allow-same-origin"
    />
  );

  const enlargeButton = (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      aria-label={expanded ? "Close" : "Enlarge"}
      className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-void-deep/80 text-mist backdrop-blur transition-colors hover:text-mist-bright"
    >
      {expanded ? <CloseIcon /> : <ExpandIcon />}
    </button>
  );

  if (expanded) {
    return (
      <div
        onClick={() => setExpanded(false)}
        className="animate-backdrop-fade fixed inset-0 z-50 flex items-center justify-center bg-void/20 p-4 backdrop-blur-sm sm:p-8"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="animate-modal-pop relative flex h-[70vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-line bg-void shadow-2xl sm:w-[70vw]"
          aria-busy={!ready}
        >
          {iframe}
          <IslandVeil ready={ready} />
          {!ready && <span className="sr-only">Loading island</span>}
          <div className="flex shrink-0 items-center justify-end border-t border-line px-4 py-2.5">
            {dedicatedSrc && <DedicatedLink href={dedicatedSrc} />}
          </div>
          {enlargeButton}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        className="relative aspect-video overflow-hidden rounded-lg border border-line"
        aria-busy={!ready}
      >
        <div className="relative flex h-full w-full flex-col">{iframe}</div>
        <IslandVeil ready={ready} />
        {!ready && <span className="sr-only">Loading island</span>}
        {enlargeButton}
      </div>
      {isPreview && dedicatedSrc ? (
        <PreviewNote dedicatedSrc={dedicatedSrc} />
      ) : dedicatedSrc ? (
        <div className="mt-2 flex justify-end">
          <DedicatedLink href={dedicatedSrc} />
        </div>
      ) : null}
    </div>
  );
}
