import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useEditAction } from "./useEditAction";
import { GlobalActions } from "./types";

vi.mock("@sito/dashboard", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  ActionType: {},
}));

const record = { id: 5, createdAt: new Date(), updatedAt: new Date(), deletedAt: null };
const deletedRecord = { ...record, deletedAt: new Date() };

describe("useEditAction", () => {
  it("returns action with the Edit id", () => {
    const { result } = renderHook(() => useEditAction({ onClick: vi.fn() }));
    expect(result.current.action(record).id).toBe(GlobalActions.Edit);
  });

  it("is not hidden when record is active", () => {
    const { result } = renderHook(() => useEditAction({ onClick: vi.fn() }));
    expect(result.current.action(record).hidden).toBe(false);
  });

  it("is hidden when record has deletedAt set", () => {
    const { result } = renderHook(() => useEditAction({ onClick: vi.fn() }));
    expect(result.current.action(deletedRecord).hidden).toBe(true);
  });

  it("is hidden when hidden prop is true", () => {
    const { result } = renderHook(() =>
      useEditAction({ onClick: vi.fn(), hidden: true })
    );
    expect(result.current.action(record).hidden).toBe(true);
  });

  it("calls onClick with the record id", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useEditAction({ onClick }));
    result.current.action(record).onClick!();
    expect(onClick).toHaveBeenCalledWith(5);
  });
});
