"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Test } from "@/lib/tests";
import TestCard from "@/components/TestCard";
import { isShortcut, useShortcutLabel } from "@/lib/shortcut";

export interface ProviderOption {
  /** Provider slug, matching Test.provider. */
  slug: string;
  /** Company name shown on the badge. */
  name: string;
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

export default function TestBrowser({
  tests,
  providers,
}: {
  tests: Test[];
  providers: ProviderOption[];
}) {
  const [query, setQuery] = useState("");
  // One provider selected at a time; null means "all".
  const [active, setActive] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcut = useShortcutLabel("K");

  // ⌘K / Ctrl+K puts the cursor in the search field from anywhere on the page,
  // selecting what's there so a second search just overtypes the first.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!isShortcut(e, "k")) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Provider name by slug, so search can also match the company label.
  const providerName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of providers) map.set(p.slug, p.name);
    return map;
  }, [providers]);

  // Clicking the active badge again clears the filter.
  const select = (slug: string) =>
    setActive((prev) => (prev === slug ? null : slug));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((test) => {
      // A badge-based provider filter narrows to the selected provider.
      if (active && test.provider !== active) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        test.title,
        test.model,
        test.summary,
        test.provider ? providerName.get(test.provider) ?? "" : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [tests, query, active, providerName]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-line focus-within:border-mist">
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search tests by name, model, or provider…"
            aria-label="Search tests"
            className="min-w-0 flex-1 border-0 bg-transparent px-0 py-2 text-sm text-mist-bright placeholder:text-mist focus:outline-none"
          />
          {/* The shortcut is only worth naming while it's the way in — once the
              field has the cursor, the hint is describing what already
              happened. Spelled with the modifier this machine actually uses. */}
          {shortcut && !focused && !query && (
            <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] tracking-wide text-mist sm:block">
              {shortcut}
            </kbd>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {providers.map((provider) => {
            const isActive = active === provider.slug;
            return (
              <button
                key={provider.slug}
                type="button"
                aria-pressed={isActive}
                onClick={() => select(provider.slug)}
                className={`rounded-md border px-3.5 py-1 text-xs uppercase tracking-[0.12em] transition-colors ${
                  isActive
                    ? "border-mist-bright bg-mist-bright text-void"
                    : "border-line text-mist hover:border-mist hover:text-mist-bright"
                }`}
              >
                {provider.name}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((test) => (
            <TestCard key={test.slug} test={test} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-mist">
          No tests match your search.
        </p>
      )}
    </div>
  );
}
