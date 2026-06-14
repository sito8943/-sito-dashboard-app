import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { faPencil } from "@fortawesome/free-solid-svg-icons";

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

  it("respects override props and propagates action style props", () => {
    const { result } = renderHook(() =>
      useImportAction({
        onClick: vi.fn(),
        id: "custom-import",
        icon: faPencil,
        tooltip: "Custom import",
        className: "row-action",
        iconClassName: "row-action-icon",
        labelClassName: "row-action-label",
      }),
    );

    expect(result.current.action()).toEqual(
      expect.objectContaining({
        id: "custom-import",
        tooltip: "Custom import",
        className: "row-action",
        iconClassName: "row-action-icon",
        labelClassName: "row-action-label",
      }),
    );
  });
});
