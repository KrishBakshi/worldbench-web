"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ArxivIcon from "@/components/icons/arxiv";
import GitHubIcon from "@/components/icons/github";
import HuggingFaceIcon from "@/components/icons/huggingface";
import { BIBTEX, LINKS } from "@/lib/links";
import { cn } from "@/lib/utils";

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
    >
      {children}
    </svg>
  );
}

const QuoteIcon = () => (
  <Glyph>
    <path d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6" />
  </Glyph>
);

const CheckIcon = () => (
  <Glyph>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Glyph>
);

// Code is listed even though the header carries a GitHub mark too: that one is
// site chrome (with the star count), this row is the paper's artifacts, and
// readers coming from the paper look for Code beside Paper.
const mark = { width: 14, height: 14, "aria-hidden": true } as const;

const items = [
  { label: "Paper", href: LINKS.paper, icon: <ArxivIcon {...mark} />, title: "arXiv preprint" },
  { label: "Code", href: LINKS.code, icon: <GitHubIcon {...mark} />, title: "Source on GitHub" },
  {
    label: "Dataset",
    href: LINKS.dataset,
    icon: <HuggingFaceIcon {...mark} />,
    title: "Dataset on Hugging Face",
  },
  { label: "Space", href: LINKS.space, icon: <HuggingFaceIcon {...mark} />, title: "Space on Hugging Face" },
];

const itemClass =
  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-mist transition-colors hover:bg-line/60 hover:text-mist-bright";

/**
 * The home page's reference row: where the paper, code and data live. Kept to
 * one quiet line of muted labels under the call to action, so it answers "is
 * there a paper?" without competing with the island or the button. "Cite"
 * copies the BibTeX in place rather than sending people elsewhere for it.
 */
export default function ReferenceLinks({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context, permissions): the BibTeX is
      // also on the About page, so there's nothing worth surfacing here.
    }
  }

  return (
    <nav
      aria-label="Paper, code and data"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-1 gap-y-1 font-display text-[11px] uppercase tracking-[0.18em]",
        className,
      )}
    >
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.title}
          className={itemClass}
        >
          {item.icon}
          {item.label}
        </a>
      ))}
      <span aria-hidden="true" className="mx-1 h-3.5 w-px bg-line" />
      <button
        type="button"
        onClick={copyCitation}
        title="Copy BibTeX"
        className={cn(itemClass, "cursor-pointer uppercase", copied && "text-glow hover:text-glow")}
      >
        {copied ? <CheckIcon /> : <QuoteIcon />}
        <span aria-live="polite">{copied ? "Copied" : "Cite"}</span>
      </button>
    </nav>
  );
}
