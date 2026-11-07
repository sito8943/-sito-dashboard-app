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

describe("theme.css dark defaults", () => {
  const darkBlock = (css: string) =>
    css.match(/:where\(\.dark\)\s*\{[^}]*\}/)?.[0];

  it("ships weak :where(.dark) token defaults", () => {
    const block = darkBlock(theme);
    expect(block).toBeDefined();
    expect(block).toContain("--color-base: #0f141c;");
    expect(block).toContain("--color-on-brand: #f1f5fb;");
  });

  it("keeps the dark defaults in sync with the bundled src/index.css", () => {
    const indexCss = readFileSync(
      resolve(process.cwd(), "src/index.css"),
      "utf8",
    );
    expect(darkBlock(indexCss)).toBe(darkBlock(theme));
  });
});

describe("brand surface icon buttons", () => {
  const brandBlock = (css: string) =>
    css.match(
      /\/\* Icon buttons on brand surfaces[\s\S]*?\/\* End brand surfaces \*\//,
    )?.[0];

  // Regression: @sito/ui's `.sito-ui-button--text { color: var(--sito-ui-color-text) }`
  // loads after the lib CSS and painted the Page back arrow dark on the brand header.
  it("re-points @sito/ui text color on brand surfaces", () => {
    expect(brandBlock(theme)).toMatch(
      /\.header,\s*\.page-header\s*\{\s*--sito-ui-color-text: var\(--color-on-brand\);/,
    );
  });

  it("colors icon buttons with --color-on-brand above single-class specificity", () => {
    expect(brandBlock(theme)).toMatch(
      /:is\(\.header, \.page-header\) :is\(\.icon-button, \.action\) \{\s*color: var\(--color-on-brand\);/,
    );
  });

  it("gives them a visible focus-visible outline", () => {
    expect(brandBlock(theme)).toMatch(
      /:focus-visible \{\s*outline: 2px solid var\(--color-on-brand\);/,
    );
  });

  it("keeps the block in sync with the bundled src/index.css", () => {
    const indexCss = readFileSync(
      resolve(process.cwd(), "src/index.css"),
      "utf8",
    );
    expect(brandBlock(indexCss)).toBeDefined();
    expect(brandBlock(indexCss)).toBe(brandBlock(theme));
  });
});
