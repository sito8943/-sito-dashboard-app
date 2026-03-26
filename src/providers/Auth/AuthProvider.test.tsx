import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "./AuthProvider";

import type { SessionDto } from "lib";

const { logoutMock, getSessionMock } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock("../ManagerProvider", () => ({
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

const customStorageWrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider
    user="custom_user"
    remember="custom_remember"
    refreshTokenKey="custom_refresh"
    accessTokenExpiresAtKey="custom_access_expiry"
  >
    {children}
  </AuthProvider>
);

const session: SessionDto = {
  id: 1,
  username: "sito",
  email: "sito@mail.com",
  token: "jwt-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2030-01-01T00:00:00.000Z",
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    logoutMock.mockReset();
    getSessionMock.mockReset();
  });

  it("stores session and auth metadata when logging user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setGuestMode(true);
      result.current.logUser(session, true);
    });

    expect(result.current.account).toEqual(session);
    expect(localStorage.getItem("user")).toBe("jwt-token");
    expect(localStorage.getItem("remember")).toBe("true");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
    expect(localStorage.getItem("accessTokenExpiresAt")).toBe(
      "2030-01-01T00:00:00.000Z",
    );
    expect(localStorage.getItem("guest_mode")).toBeNull();
  });

  it("logs out user and removes stored auth data", async () => {
    logoutMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logUser(session, true);
    });

    await act(async () => {
      await result.current.logoutUser();
    });

    expect(logoutMock).toHaveBeenCalledWith({
      accessToken: "jwt-token",
      refreshToken: "refresh-token",
    });
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("remember")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("accessTokenExpiresAt")).toBeNull();
    expect(result.current.account.token).toBeUndefined();
  });

  it("prioritizes localStorage access token during logout", async () => {
    logoutMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logUser(
        { ...session, token: "stale-in-memory-token" },
        true,
      );
    });
    localStorage.setItem("user", "fresh-local-token");

    await act(async () => {
      await result.current.logoutUser();
    });

    expect(logoutMock).toHaveBeenCalledWith({
      accessToken: "fresh-local-token",
      refreshToken: "refresh-token",
    });
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
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
    expect(localStorage.getItem("accessTokenExpiresAt")).toBe(
      "2030-01-01T00:00:00.000Z",
    );
  });

  it("falls back to logout when session recovery fails", async () => {
    getSessionMock.mockRejectedValue(new Error("Session expired"));
    logoutMock.mockResolvedValue(undefined);
    localStorage.setItem("user", "stale-token");
    localStorage.setItem("refreshToken", "stale-refresh-token");
    localStorage.setItem("accessTokenExpiresAt", "2020-01-01T00:00:00.000Z");
    localStorage.setItem("remember", "true");
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
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("accessTokenExpiresAt")).toBeNull();
    expect(localStorage.getItem("remember")).toBeNull();
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
      "authContext must be used within a Provider",
    );

    consoleErrorSpy.mockRestore();
  });

  it("supports custom storage keys", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: customStorageWrapper,
    });

    act(() => {
      result.current.logUser(session, true);
    });

    expect(localStorage.getItem("custom_user")).toBe("jwt-token");
    expect(localStorage.getItem("custom_remember")).toBe("true");
    expect(localStorage.getItem("custom_refresh")).toBe("refresh-token");
    expect(localStorage.getItem("custom_access_expiry")).toBe(
      "2030-01-01T00:00:00.000Z",
    );
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("remember")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("accessTokenExpiresAt")).toBeNull();
  });
});
