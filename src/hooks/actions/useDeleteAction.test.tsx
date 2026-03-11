import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDeleteAction } from "./useDeleteAction";
import { GlobalActions } from "./types";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  ActionType: {},
}));

const record = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
const deletedRecord = { ...record, deletedAt: new Date() };

describe("useDeleteAction", () => {
  it("returns action with the Delete id", () => {
    const { result } = renderHook(() => useDeleteAction({ onClick: vi.fn() }));
    expect(result.current.action(record).id).toBe(GlobalActions.Delete);
  });

  it("is not hidden when record is active", () => {
    const { result } = renderHook(() => useDeleteAction({ onClick: vi.fn() }));
    expect(result.current.action(record).hidden).toBe(false);
  });

  it("is hidden when record has deletedAt set", () => {
    const { result } = renderHook(() => useDeleteAction({ onClick: vi.fn() }));
    expect(result.current.action(deletedRecord).hidden).toBe(true);
  });

  it("is hidden when hidden prop is true", () => {
    const { result } = renderHook(() =>
      useDeleteAction({ onClick: vi.fn(), hidden: true }),
    );
    expect(result.current.action(record).hidden).toBe(true);
  });

  it("calls onClick with an array containing the record id", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useDeleteAction({ onClick }));
    result.current.action(record).onClick!();
    expect(onClick).toHaveBeenCalledWith([1]);
  });

  it("calls onClick with ids from all rows on multiple click", () => {
    const onClick = vi.fn();
    const rows = [
      { id: 1, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
      { id: 2, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
    ];
    const { result } = renderHook(() => useDeleteAction({ onClick }));
    result.current.action(record).onMultipleClick!(rows);
    expect(onClick).toHaveBeenCalledWith([1, 2]);
  });
});
