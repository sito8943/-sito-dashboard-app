import { afterEach, describe, expect, it } from "vitest";

import { isMac } from "./os";

const setNavigatorProp = (name: string, value: unknown) => {
  Object.defineProperty(navigator, name, {
    configurable: true,
    value,
  });
};

describe("isMac", () => {
  const originalPlatform = navigator.platform;
  const originalUserAgentData = (navigator as { userAgentData?: unknown })
    .userAgentData;

  afterEach(() => {
    setNavigatorProp("platform", originalPlatform);
    setNavigatorProp("userAgentData", originalUserAgentData);
  });

  it("returns true when userAgentData platform is an Apple device", () => {
    setNavigatorProp("platform", "Win32");
    setNavigatorProp("userAgentData", { platform: "iPhone" });

    expect(isMac()).toBe(true);
  });

  it("returns true when platform is Mac and userAgentData is missing", () => {
    setNavigatorProp("platform", "MacIntel");
    setNavigatorProp("userAgentData", undefined);

    expect(isMac()).toBe(true);
  });

  it("returns false for non Apple platforms", () => {
    setNavigatorProp("platform", "Linux x86_64");
    setNavigatorProp("userAgentData", undefined);

    expect(isMac()).toBe(false);
  });
});
