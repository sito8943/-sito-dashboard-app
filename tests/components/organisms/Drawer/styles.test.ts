import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(process.cwd(), "src/components/organisms/Drawer/styles.css"),
  "utf8",
);

const drawerRule = css.match(/^\.drawer\s*\{([^}]*)\}/m)?.[1] ?? "";

describe("Drawer styles", () => {
  // Regression: a fixed 100vh drawer with no overflow cut off its last
  // entries on short (mobile) screens.
  it("scrolls on its own without dragging the page", () => {
    expect(drawerRule).toContain("overflow-y-auto");
    expect(drawerRule).toContain("overscroll-contain");
  });

  it("is as tall as the visible viewport", () => {
    expect(drawerRule).toContain("h-dvh");
    expect(drawerRule).not.toContain("h-screen");
  });
});
