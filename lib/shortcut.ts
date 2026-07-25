"use client";

import { useSyncExternalStore } from "react";

export type Modifier = "⌘" | "Ctrl";

/** Nothing to subscribe to: the platform doesn't change mid-session. */
const subscribe = () => () => {};

let detected: Modifier | null = null;

function readModifier(): Modifier {
  if (!detected) {
    // userAgentData.platform is the supported reading; navigator.platform is
    // deprecated but still the only answer in Safari and Firefox.
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ||
      navigator.platform ||
      "";
    detected = /mac/i.test(platform) ? "⌘" : "Ctrl";
  }
  return detected;
}

/** The server, and the hydrating render, know nothing about the keyboard. */
const readNothing = () => null;

/**
 * The modifier a keyboard shortcut is spelled with on the reader's own machine:
 * `⌘` on a Mac, `Ctrl` everywhere else. A hint that names the wrong key is worse
 * than none, and the site is static, so this is settled in the browser.
 *
 * Returns null on the server and on the first client render, since the platform
 * isn't known while the markup is being matched up — render nothing until it is,
 * rather than guessing one and correcting it a frame later.
 */
export function useModifierKey(): Modifier | null {
  return useSyncExternalStore(subscribe, readModifier, readNothing);
}

/**
 * The shortcut as it should be printed on a hint: `⌘K` where the symbol carries
 * the meaning, `Ctrl K` where the word needs the space. Null until the platform
 * is known — see useModifierKey.
 */
export function useShortcutLabel(key: string): string | null {
  const modifier = useModifierKey();
  if (!modifier) return null;
  return modifier === "⌘" ? `⌘${key}` : `Ctrl ${key}`;
}

/**
 * Whether a keydown is the platform's own "modifier + key". Ctrl is accepted on
 * a Mac too: it costs nothing, and someone on an external PC keyboard reaching
 * for Ctrl+K means the same thing by it.
 */
export function isShortcut(e: KeyboardEvent, key: string): boolean {
  return e.key.toLowerCase() === key.toLowerCase() && (e.metaKey || e.ctrlKey);
}
