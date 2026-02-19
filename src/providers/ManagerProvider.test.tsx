import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ManagerProvider, useManager } from "./ManagerProvider";

import type { IManager } from "lib";

const manager = {
  Auth: {
    logout: vi.fn(),
    getSession: vi.fn(),
  },
} as unknown as IManager;

const wrapper = ({ children }: { children: ReactNode }) => (
  <ManagerProvider manager={manager}>{children}</ManagerProvider>
);

describe("ManagerProvider", () => {
  it("returns manager instance when used inside provider", () => {
    const { result } = renderHook(() => useManager(), { wrapper });

    expect(result.current).toBe(manager);
  });

  it("throws when useManager is called outside provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useManager())).toThrow(
      "managerContext must be used within a Provider"
    );

    consoleErrorSpy.mockRestore();
  });
});
