import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRestoreAction } from "./useRestoreAction";
import { GlobalActions } from "./types";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const record = { id: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
const deletedRecord = { ...record, deletedAt: new Date() };

describe("useRestoreAction", () => {
  it("returns action with the Restore id", () => {
    const { result } = renderHook(() => useRestoreAction({ onClick: vi.fn() }));
    expect(result.current.action(record).id).toBe(GlobalActions.Restore);
  });

  it("is hidden when record is active (not deleted)", () => {
    const { result } = renderHook(() => useRestoreAction({ onClick: vi.fn() }));
    expect(result.current.action(record).hidden).toBe(true);
  });

  it("is visible when record has deletedAt set", () => {
    const { result } = renderHook(() => useRestoreAction({ onClick: vi.fn() }));
    expect(result.current.action(deletedRecord).hidden).toBe(false);
  });

  it("is hidden when hidden prop is true regardless of deletedAt", () => {
    const { result } = renderHook(() =>
      useRestoreAction({ onClick: vi.fn(), hidden: true })
    );
    expect(result.current.action(deletedRecord).hidden).toBe(true);
  });

  it("calls onClick with an array containing the record id", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useRestoreAction({ onClick }));
    result.current.action(deletedRecord).onClick!();
    expect(onClick).toHaveBeenCalledWith([1]);
  });

  it("calls onClick with ids from all rows on multiple click", () => {
    const onClick = vi.fn();
    const rows = [
      { id: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: new Date() },
      { id: 3, createdAt: new Date(), updatedAt: new Date(), deletedAt: new Date() },
    ];
    const { result } = renderHook(() => useRestoreAction({ onClick }));
    result.current.action(deletedRecord).onMultipleClick!(rows);
    expect(onClick).toHaveBeenCalledWith([1, 3]);
  });
});
