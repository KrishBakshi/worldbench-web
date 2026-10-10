/** Each scored test's shade on the teal ramp, keyed by test id so a test keeps its colour
 *  wherever it appears, whatever order a chart lists it in. Tokens live in
 *  app/globals.css with their light and dark steps. */
const TEST_COLOR: Record<string, string> = {
  WC001: "var(--color-test-voxel)",
  WC002: "var(--color-test-placement)",
  WC003: "var(--color-test-contents)",
  WC004: "var(--color-test-physics)",
  WC005: "var(--color-test-cycles)",
};

export const testColor = (id: string) => TEST_COLOR[id] ?? "var(--color-mist)";
