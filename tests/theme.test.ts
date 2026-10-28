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

describe("theme.css select/autocomplete", () => {
  // Regression for #104: hardcoded slate-200 made highlighted options unreadable in dark themes.
  it("uses a theme token for highlighted options", () => {
    const rule = theme.match(
      /\.autocomplete-suggestion-item\.highlighted\s*\{([^}]*)\}/,
    );
    expect(rule?.[1]).toContain("var(--color-base-dark)");
    expect(theme).not.toContain("--color-slate-200");
  });
});

describe("Dialog styles", () => {
  const dialogCss = readFileSync(
    resolve(process.cwd(), "src/components/organisms/Dialog/styles.css"),
    "utf8",
  );

  // Regression for #103: @sito/ui's header/actions surface overrode the dialog body color.
  it("scopes header/actions background under .dialog", () => {
    expect(dialogCss).toMatch(
      /\.dialog \.dialog-header,\s*\.dialog \.dialog-actions\s*\{\s*@apply bg-base;/,
    );
  });
});
