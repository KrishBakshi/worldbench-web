import type { ReactNode } from "react";

/**
 * Standalone caveat badge for a test's detail page — e.g. an unverified or
 * anonymous provider. Kept visually distinct from `summary`'s prose (which
 * reads as a description) so a caveat reads as a caveat. Driven by the
 * `notice` frontmatter field in a test's meta.mdx; reusable across any test
 * that needs one, not specific to a single model.
 *
 * Supports inline `[text](url)` markdown links, rendered as new-tab anchors,
 * so a notice can point at e.g. the test that later revealed a stealth model.
 */
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderNotice(text: string) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-void/70"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function TestNotice({ children }: { children: string }) {
  return (
    // The card's own bg/text colours match the site's global ::selection
    // colours, so selecting text here would otherwise be invisible — invert
    // it locally against the card instead (see globals.css).
    <div className="notice-card mt-4 flex items-start gap-3 rounded-md bg-mist-bright px-4 py-3 text-void">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 shrink-0"
      >
        <path d="M12 3.5 22 20.5H2Z" strokeLinejoin="round" />
        <line x1="12" y1="10" x2="12" y2="14.5" />
        <line x1="12" y1="17.25" x2="12.01" y2="17.25" />
      </svg>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">Notice</p>
        <p className="mt-1 text-xs leading-relaxed">{renderNotice(children)}</p>
      </div>
    </div>
  );
}
