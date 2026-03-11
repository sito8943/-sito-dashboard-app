import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useImportAction } from "./useImportAction";
import { GlobalActions } from "./types";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("useImportAction", () => {
  it("returns action with the Import id", () => {
    const { result } = renderHook(() => useImportAction({ onClick: vi.fn() }));
    expect(result.current.action().id).toBe(GlobalActions.Import);
  });

  it("is not hidden by default", () => {
    const { result } = renderHook(() => useImportAction({ onClick: vi.fn() }));
    expect(result.current.action().hidden).toBe(false);
  });

  it("is hidden when hidden prop is true", () => {
    const { result } = renderHook(() =>
      useImportAction({ onClick: vi.fn(), hidden: true }),
    );
    expect(result.current.action().hidden).toBe(true);
  });

  it("is disabled when disabled prop is true", () => {
    const { result } = renderHook(() =>
      useImportAction({ onClick: vi.fn(), disabled: true }),
    );
    expect(result.current.action().disabled).toBe(true);
  });

  it("calls onClick when the action is triggered", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useImportAction({ onClick }));
    result.current.action().onClick!();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
