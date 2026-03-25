import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";

import { SupabaseAuthProvider } from "./SupabaseAuthProvider";
import { useAuth } from "providers/Auth";

let authStateHandler:
  | ((event: string, session: Session | null) => void)
  | undefined;

const { signOutMock, getSessionMock, onAuthStateChangeMock, unsubscribeMock } =
  vi.hoisted(() => ({
    signOutMock: vi.fn(),
    getSessionMock: vi.fn(),
    onAuthStateChangeMock: vi.fn(),
    unsubscribeMock: vi.fn(),
  }));

vi.mock("./SupabaseManagerProvider", () => ({
  useSupabase: () => ({
    auth: {
      signOut: signOutMock,
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  }),
}));

const createSupabaseSession = (overrides?: Partial<Session>): Session => {
  return {
    access_token: "access-token",
    refresh_token: "refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: 1893456000,
    user: {
      id: "1",
      email: "sito@mail.com",
      user_metadata: {
        username: "sito",
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: "2024-01-01T00:00:00.000Z",
    },
    ...overrides,
  } as unknown as Session;
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
);

describe("SupabaseAuthProvider", () => {
  beforeEach(() => {
    authStateHandler = undefined;
    signOutMock.mockReset();
    getSessionMock.mockReset();
    onAuthStateChangeMock.mockReset();
    unsubscribeMock.mockReset();

    onAuthStateChangeMock.mockImplementation(
      (callback: (event: string, session: Session | null) => void) => {
        authStateHandler = callback;
        return {
          data: {
            subscription: {
              unsubscribe: unsubscribeMock,
            },
          },
        };
      },
    );
  });

  it("initializes account from getSession on mount", async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: createSupabaseSession(),
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.account.token).toBe("access-token");
    });

    expect(getSessionMock).toHaveBeenCalledOnce();
    expect(localStorage.getItem("user")).toBe("access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
    expect(localStorage.getItem("accessTokenExpiresAt")).toBe(
      "2030-01-01T00:00:00.000Z",
    );
  });

  it("updates auth state from onAuthStateChange callbacks", async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: null,
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(getSessionMock).toHaveBeenCalledOnce();
    });

    act(() => {
      authStateHandler?.(
        "SIGNED_IN",
        createSupabaseSession({ access_token: "token-from-state-change" }),
      );
    });

    expect(result.current.account.token).toBe("token-from-state-change");
    expect(localStorage.getItem("user")).toBe("token-from-state-change");

    act(() => {
      authStateHandler?.("SIGNED_OUT", null);
    });

    expect(result.current.account.token).toBeUndefined();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("accessTokenExpiresAt")).toBeNull();
  });

  it("logoutUser calls supabase signOut and clears storage", async () => {
    signOutMock.mockResolvedValue({ error: null });
    getSessionMock.mockResolvedValue({
      data: {
        session: createSupabaseSession(),
      },
      error: null,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.account.token).toBe("access-token");
    });

    await act(async () => {
      await result.current.logoutUser();
    });

    expect(signOutMock).toHaveBeenCalledOnce();
    expect(result.current.account.token).toBeUndefined();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("remember")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("accessTokenExpiresAt")).toBeNull();
  });

  it("supports guest mode and unsubscribes auth listener on unmount", async () => {
    getSessionMock.mockResolvedValue({
      data: {
        session: null,
      },
      error: null,
    });

    const { result, unmount } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(getSessionMock).toHaveBeenCalledOnce();
    });

    act(() => {
      result.current.setGuestMode(true);
    });

    expect(result.current.isInGuestMode()).toBe(true);

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledOnce();
  });
});
