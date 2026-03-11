import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useScrollTrigger } from "./useScrollTrigger";

describe("useScrollTrigger", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  it("returns false initially", () => {
    const { result } = renderHook(() => useScrollTrigger(200));
    expect(result.current).toBe(false);
  });

  it("returns true when scrolled past the offset", () => {
    const { result } = renderHook(() => useScrollTrigger(200));
    act(() => {
      Object.defineProperty(window, "scrollY", {
        value: 201,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);
  });

  it("returns false when scrolled exactly to the offset", () => {
    const { result } = renderHook(() => useScrollTrigger(200));
    act(() => {
      Object.defineProperty(window, "scrollY", {
        value: 200,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);
  });

  it("returns false when scrolled back above the offset", () => {
    const { result } = renderHook(() => useScrollTrigger(200));
    act(() => {
      Object.defineProperty(window, "scrollY", {
        value: 300,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    act(() => {
      Object.defineProperty(window, "scrollY", {
        value: 50,
        configurable: true,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);
  });
});
