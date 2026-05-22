import { beforeEach, describe, expect, it } from "vitest";

import {
  lockBodyScroll,
  resetBodyScrollLockForTests,
  unlockBodyScroll,
} from "./bodyScrollLock";

describe("bodyScrollLock", () => {
  beforeEach(() => {
    resetBodyScrollLockForTests();
  });

  it("restores previous overflow value after unlock", () => {
    document.body.style.overflow = "scroll";

    lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");

    unlockBodyScroll();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("keeps body locked until all concurrent locks are released", () => {
    document.body.style.overflow = "visible";

    lockBodyScroll();
    lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");

    unlockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");

    unlockBodyScroll();
    expect(document.body.style.overflow).toBe("visible");
  });

  it("does not alter overflow when unlocking without active locks", () => {
    document.body.style.overflow = "clip";

    unlockBodyScroll();
    expect(document.body.style.overflow).toBe("clip");
  });
});
