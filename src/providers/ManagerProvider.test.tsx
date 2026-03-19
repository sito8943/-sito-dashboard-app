import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

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
      "managerContext must be used within a Provider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("uses a provided query client when queryClient prop is passed", () => {
    const customQueryClient = new QueryClient();
    const customWrapper = ({ children }: { children: ReactNode }) => (
      <ManagerProvider manager={manager} queryClient={customQueryClient}>
        {children}
      </ManagerProvider>
    );

    const { result } = renderHook(() => useQueryClient(), {
      wrapper: customWrapper,
    });

    expect(result.current).toBe(customQueryClient);
  });

  it("creates an isolated default query client per provider instance", () => {
    const wrapperOne = ({ children }: { children: ReactNode }) => (
      <ManagerProvider manager={manager}>{children}</ManagerProvider>
    );
    const wrapperTwo = ({ children }: { children: ReactNode }) => (
      <ManagerProvider manager={manager}>{children}</ManagerProvider>
    );

    const first = renderHook(() => useQueryClient(), {
      wrapper: wrapperOne,
    });
    const second = renderHook(() => useQueryClient(), {
      wrapper: wrapperTwo,
    });

    expect(first.result.current).not.toBe(second.result.current);
  });
});
