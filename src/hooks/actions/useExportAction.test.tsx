import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useExportAction } from "./useExportAction";
import { GlobalActions } from "./types";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("useExportAction", () => {
  it("returns action with the Export id", () => {
    const { result } = renderHook(() => useExportAction({ onClick: vi.fn() }));
    expect(result.current.action().id).toBe(GlobalActions.Export);
  });

  it("is not hidden by default", () => {
    const { result } = renderHook(() => useExportAction({ onClick: vi.fn() }));
    expect(result.current.action().hidden).toBe(false);
  });

  it("is hidden when hidden prop is true", () => {
    const { result } = renderHook(() =>
      useExportAction({ onClick: vi.fn(), hidden: true })
    );
    expect(result.current.action().hidden).toBe(true);
  });

  it("is not disabled by default", () => {
    const { result } = renderHook(() => useExportAction({ onClick: vi.fn() }));
    expect(result.current.action().disabled).toBe(false);
  });

  it("is disabled when disabled prop is true", () => {
    const { result } = renderHook(() =>
      useExportAction({ onClick: vi.fn(), disabled: true })
    );
    expect(result.current.action().disabled).toBe(true);
  });

  it("calls onClick when the action is triggered", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useExportAction({ onClick }));
    result.current.action().onClick!();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
