import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "./AuthProvider";

import type { SessionDto } from "lib";

const { logoutMock, getSessionMock } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock("./ManagerProvider", () => ({
  useManager: () => ({
    Auth: {
      logout: logoutMock,
      getSession: getSessionMock,
    },
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const session: SessionDto = {
  id: 1,
  username: "sito",
  email: "sito@mail.com",
  token: "jwt-token",
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    logoutMock.mockReset();
    getSessionMock.mockReset();
  });

  it("stores session and token when logging user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setGuestMode(true);
      result.current.logUser(session);
    });

    expect(result.current.account).toEqual(session);
    expect(localStorage.getItem("user")).toBe("jwt-token");
    expect(localStorage.getItem("guest_mode")).toBeNull();
  });

  it("logs out user and removes token from local storage", async () => {
    logoutMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logUser(session);
    });

    await act(async () => {
      await result.current.logoutUser();
    });

    expect(logoutMock).toHaveBeenCalledOnce();
    expect(localStorage.getItem("user")).toBeNull();
    expect(result.current.account.token).toBeUndefined();
  });

  it("loads session from manager and logs user", async () => {
    getSessionMock.mockResolvedValue(session);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logUserFromLocal();
    });

    expect(getSessionMock).toHaveBeenCalledOnce();
    expect(result.current.account).toEqual(session);
    expect(localStorage.getItem("user")).toBe("jwt-token");
  });

  it("falls back to logout when session recovery fails", async () => {
    getSessionMock.mockRejectedValue(new Error("Session expired"));
    logoutMock.mockResolvedValue(undefined);
    localStorage.setItem("user", "stale-token");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logUserFromLocal();
    });

    expect(getSessionMock).toHaveBeenCalledOnce();
    expect(logoutMock).toHaveBeenCalledOnce();
    expect(localStorage.getItem("user")).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("detects guest mode only when enabled and no token is loaded", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setGuestMode(true);
    });
    expect(result.current.isInGuestMode()).toBe(true);

    act(() => {
      result.current.logUser(session);
    });
    expect(result.current.isInGuestMode()).toBe(false);
  });

  it("throws when useAuth is called outside AuthProvider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => renderHook(() => useAuth())).toThrow(
      "authContext must be used within a Provider"
    );

    consoleErrorSpy.mockRestore();
  });
});
