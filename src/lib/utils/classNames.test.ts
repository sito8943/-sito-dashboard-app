import { describe, expect, it } from "vitest";

import { classNames } from "./classNames";

describe("classNames", () => {
  it("joins and trims class names", () => {
    expect(classNames(" button ", " primary ")).toBe("button primary");
  });

  it("skips empty, null, undefined and false values", () => {
    expect(classNames("base", "   ", undefined, null, false, "active")).toBe(
      "base active",
    );
  });

  it("returns an empty string when every value is invalid", () => {
    expect(classNames(" ", undefined, null, false)).toBe("");
  });
});
