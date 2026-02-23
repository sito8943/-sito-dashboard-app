import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDialog } from "./useDialog";

describe("useDialog", () => {
  it("starts closed by default", () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.open).toBe(false);
  });

  it("opens when handleOpen is called", () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.handleOpen());
    expect(result.current.open).toBe(true);
  });

  it("closes when handleClose is called", () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.handleOpen());
    act(() => result.current.handleClose());
    expect(result.current.open).toBe(false);
  });

  it("sets open directly via setOpen", () => {
    const { result } = renderHook(() => useDialog());
    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(true);
    act(() => result.current.setOpen(false));
    expect(result.current.open).toBe(false);
  });
});
