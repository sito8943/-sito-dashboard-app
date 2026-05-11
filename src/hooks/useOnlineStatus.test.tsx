import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  configureOnlineStatus,
  probeServerReachability,
  setServerReachable,
  useOnlineStatus,
  useOnlineStatusSnapshot,
} from "./useOnlineStatus";

const setNavigatorOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
};

describe("useOnlineStatus", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    configureOnlineStatus({
      checkIntervalMs: 30000,
      probeUrl: "/",
      timeoutMs: 5000,
      probeMethod: "HEAD",
      probeRequestInit: undefined,
      resolveIsServerReachable: undefined,
    });
    setServerReachable(true);
    setNavigatorOnline(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: originalFetch,
    });
    setNavigatorOnline(true);
  });

  it("keeps offline state and skips probe when navigator is offline", async () => {
    setNavigatorOnline(false);
    const fetchMock = vi.fn();
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useOnlineStatus());

    await waitFor(() => {
      expect(result.current.lastCheckedAt).not.toBeNull();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isChecking).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("updates as online after a successful probe", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } satisfies Partial<Response>);

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() =>
      useOnlineStatus({ probeUrl: "/health", timeoutMs: 500 }),
    );

    await waitFor(() => {
      expect(result.current.lastCheckedAt).not.toBeNull();
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isChecking).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.objectContaining({
        method: "HEAD",
        cache: "no-store",
      }),
    );
  });

  it("marks as offline when probe fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network"));
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useOnlineStatus({ timeoutMs: 100 }));

    await waitFor(() => {
      expect(result.current.lastCheckedAt).not.toBeNull();
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isChecking).toBe(false);
  });

  it("runs periodic checks based on checkIntervalMs", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } satisfies Partial<Response>);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    renderHook(() => useOnlineStatus({ checkIntervalMs: 1000 }));

    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });

  it("reacts to online/offline browser events", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } satisfies Partial<Response>);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() =>
      useOnlineStatus({ checkIntervalMs: 0, timeoutMs: 100 }),
    );

    await waitFor(() => {
      expect(result.current.lastCheckedAt).not.toBeNull();
    });

    act(() => {
      setNavigatorOnline(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);

    act(() => {
      setNavigatorOnline(true);
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });
  });

  it("ignores stale probe responses after switching offline", async () => {
    let resolveProbe: ((value: Partial<Response>) => void) | null = null;
    const fetchMock = vi.fn(
      () =>
        new Promise<Partial<Response>>((resolve) => {
          resolveProbe = resolve;
        }),
    );

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() =>
      useOnlineStatus({ checkIntervalMs: 0, timeoutMs: 100 }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      setNavigatorOnline(false);
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);

    await act(async () => {
      resolveProbe?.({
        ok: true,
        status: 200,
      });
      await Promise.resolve();
    });

    expect(result.current.isOnline).toBe(false);
  });

  it("exposes full snapshot state", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } satisfies Partial<Response>);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() =>
      useOnlineStatusSnapshot({ checkIntervalMs: 0, timeoutMs: 100 }),
    );

    await waitFor(() => {
      expect(result.current.lastCheckedAt).not.toBeNull();
    });

    expect(result.current.isBrowserOnline).toBe(true);
    expect(result.current.isServerReachable).toBe(true);
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isChecking).toBe(false);
  });

  it("supports manual server reachability updates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } satisfies Partial<Response>);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() =>
      useOnlineStatusSnapshot({ checkIntervalMs: 0, timeoutMs: 100 }),
    );

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true);
    });

    act(() => {
      setServerReachable(false);
    });
    expect(result.current.isServerReachable).toBe(false);
    expect(result.current.isOnline).toBe(false);

    act(() => {
      setServerReachable(true);
    });
    expect(result.current.isServerReachable).toBe(true);
    expect(result.current.isOnline).toBe(true);
  });

  it("supports custom probe configuration for auth and status resolution", async () => {
    window.localStorage.setItem("user", "token-123");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 401,
      }),
    );
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    configureOnlineStatus({
      checkIntervalMs: 0,
      probeUrl: "/sync/status",
      timeoutMs: 500,
      probeMethod: "GET",
      probeRequestInit: () => ({
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("user")}`,
        },
      }),
      resolveIsServerReachable: (response) => response.status < 500,
    });

    const isReachable = await probeServerReachability();

    expect(isReachable).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/sync/status"),
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      }),
    );
  });

  it("does not carry previous configuration between configure calls", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } satisfies Partial<Response>);
    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      writable: true,
      value: fetchMock,
    });

    configureOnlineStatus({
      probeUrl: "/custom-status",
      probeMethod: "GET",
    });

    configureOnlineStatus();

    await probeServerReachability();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.not.stringContaining("/custom-status"),
      expect.objectContaining({
        method: "HEAD",
      }),
    );
  });
});
