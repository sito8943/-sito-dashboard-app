import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Same list as `CHIP_VARIANTS` in @sito/dashboard >= 0.3.4. Imported by hand:
// loading @sito/dashboard here would pull its CSS into the Node test runner.
const CHIP_VARIANTS = [
  "default",
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
  "none",
] as const;

const theme = readFileSync(resolve(process.cwd(), "theme.css"), "utf8");

describe("theme.css", () => {
  // Regression for sito8943/-sito-dashboard#68: chips of every variant looked the same.
  it.each(CHIP_VARIANTS)("styles the %s Chip variant", (variant) => {
    expect(theme).toContain(`.chip-main.chip-${variant}`);
  });
});
