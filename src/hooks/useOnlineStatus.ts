import { useEffect, useSyncExternalStore } from "react";

export type OnlineStatus = {
  isOnline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
};

export type UseOnlineStatusOptions = {
  checkIntervalMs?: number;
  probeUrl?: string | null;
  timeoutMs?: number;
  probeMethod?: "HEAD" | "GET";
  probeRequestInit?: RequestInit | (() => RequestInit);
  resolveIsServerReachable?: (response: Response) => boolean;
};

const DEFAULT_CHECK_INTERVAL_MS = 30000;
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_PROBE_URL: string | null = "/";
const DEFAULT_PROBE_METHOD: "HEAD" | "GET" = "HEAD";

const DEFAULT_RESOLVE_IS_SERVER_REACHABLE = (response: Response) => {
  return response.ok || response.status === 405;
};

const readNavigatorOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

export type OnlineStatusSnapshot = {
  isBrowserOnline: boolean;
  isServerReachable: boolean;
  isOnline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
};

type OnlineStatusListener = () => void;

type ResolvedUseOnlineStatusOptions = {
  checkIntervalMs: number;
  probeUrl: string | null;
  timeoutMs: number;
  probeMethod: "HEAD" | "GET";
  probeRequestInit?: RequestInit | (() => RequestInit);
  resolveIsServerReachable: (response: Response) => boolean;
};

const resolveOptions = (
  options: UseOnlineStatusOptions = {},
): ResolvedUseOnlineStatusOptions => ({
  checkIntervalMs: options.checkIntervalMs ?? DEFAULT_CHECK_INTERVAL_MS,
  probeUrl: options.probeUrl ?? DEFAULT_PROBE_URL,
  timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  probeMethod: options.probeMethod ?? DEFAULT_PROBE_METHOD,
  probeRequestInit: options.probeRequestInit,
  resolveIsServerReachable:
    options.resolveIsServerReachable ?? DEFAULT_RESOLVE_IS_SERVER_REACHABLE,
});

const withCacheBuster = (url: string) => {
  if (typeof window === "undefined") return url;

  try {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set("_ts", String(Date.now()));
    return parsed.toString();
  } catch {
    return url;
  }
};

const listeners = new Set<OnlineStatusListener>();

const initialBrowserOnline = readNavigatorOnline();
const serverSnapshot: OnlineStatusSnapshot = {
  isBrowserOnline: true,
  isServerReachable: true,
  isOnline: true,
  isChecking: false,
  lastCheckedAt: null,
};

let snapshot: OnlineStatusSnapshot = {
  isBrowserOnline: initialBrowserOnline,
  isServerReachable: true,
  isOnline: initialBrowserOnline,
  isChecking: false,
  lastCheckedAt: null,
};

let runtimeOptions = resolveOptions();
let probeInFlight: Promise<boolean> | null = null;
let probeRequestedWhileInFlight = false;
let hasWindowListeners = false;
let hasProbeListeners = false;
let probeIntervalId: number | null = null;

const emitChange = () => {
  listeners.forEach((listener) => listener());
};

const updateSnapshot = (nextValues: Partial<OnlineStatusSnapshot>) => {
  const nextBrowserOnline =
    nextValues.isBrowserOnline ?? snapshot.isBrowserOnline;
  const nextServerReachable =
    nextValues.isServerReachable ?? snapshot.isServerReachable;
  const nextIsChecking = nextValues.isChecking ?? snapshot.isChecking;
  const nextLastCheckedAt =
    nextValues.lastCheckedAt !== undefined
      ? nextValues.lastCheckedAt
      : snapshot.lastCheckedAt;
  const nextOnline = nextBrowserOnline && nextServerReachable;

  const hasChanged =
    snapshot.isBrowserOnline !== nextBrowserOnline ||
    snapshot.isServerReachable !== nextServerReachable ||
    snapshot.isChecking !== nextIsChecking ||
    snapshot.lastCheckedAt !== nextLastCheckedAt ||
    snapshot.isOnline !== nextOnline;

  if (!hasChanged) return;

  snapshot = {
    isBrowserOnline: nextBrowserOnline,
    isServerReachable: nextServerReachable,
    isOnline: nextOnline,
    isChecking: nextIsChecking,
    lastCheckedAt: nextLastCheckedAt,
  };

  emitChange();
};

const setBrowserOnline = (value: boolean) => {
  updateSnapshot({ isBrowserOnline: value });
};

export const setServerReachable = (value: boolean) => {
  updateSnapshot({ isServerReachable: value });
};

const triggerProbe = () => {
  if (probeInFlight) {
    probeRequestedWhileInFlight = true;
    return;
  }

  void probeServerReachability();
};

const readProbeRequestInit = (
  option: ResolvedUseOnlineStatusOptions["probeRequestInit"],
): RequestInit => {
  if (!option) return {};
  if (typeof option === "function") {
    return option();
  }
  return option;
};

const probeConnection = async (
  options: ResolvedUseOnlineStatusOptions,
): Promise<boolean> => {
  const { probeUrl, timeoutMs, probeMethod, resolveIsServerReachable } =
    options;
  if (typeof fetch !== "function") return readNavigatorOnline();
  if (!probeUrl) return true;

  const hasAbortController = typeof AbortController !== "undefined";
  const controller = hasAbortController ? new AbortController() : null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const requestInit = readProbeRequestInit(options.probeRequestInit);
  const { method, cache, signal, ...restRequestInit } = requestInit;
  const targetUrl = withCacheBuster(probeUrl);

  try {
    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

    const response = await fetch(targetUrl, {
      ...restRequestInit,
      method: method ?? probeMethod,
      cache: cache ?? "no-store",
      signal: signal ?? controller?.signal,
    });

    return resolveIsServerReachable(response);
  } catch {
    return false;
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
};

export const configureOnlineStatus = (options: UseOnlineStatusOptions = {}) => {
  runtimeOptions = resolveOptions(options);
  setBrowserOnline(readNavigatorOnline());

  if (hasProbeListeners) {
    if (probeIntervalId !== null && typeof window !== "undefined") {
      window.clearInterval(probeIntervalId);
      probeIntervalId = null;
    }

    if (
      Number.isFinite(runtimeOptions.checkIntervalMs) &&
      runtimeOptions.checkIntervalMs > 0 &&
      typeof window !== "undefined"
    ) {
      probeIntervalId = window.setInterval(() => {
        triggerProbe();
      }, runtimeOptions.checkIntervalMs);
    }
  }
};

export const probeServerReachability = async (
  options: UseOnlineStatusOptions = {},
): Promise<boolean> => {
  const mergedOptions = resolveOptions({ ...runtimeOptions, ...options });
  const isBrowserOnline = readNavigatorOnline();
  setBrowserOnline(isBrowserOnline);

  if (!isBrowserOnline) {
    updateSnapshot({
      isChecking: false,
      lastCheckedAt: Date.now(),
    });
    return false;
  }

  if (!mergedOptions.probeUrl) {
    setServerReachable(true);
    updateSnapshot({
      isChecking: false,
      lastCheckedAt: Date.now(),
    });
    return true;
  }

  if (probeInFlight) return probeInFlight;

  updateSnapshot({ isChecking: true });

  probeInFlight = probeConnection(mergedOptions)
    .then((isReachable) => {
      setServerReachable(isReachable);
      return isReachable;
    })
    .catch(() => {
      setServerReachable(false);
      return false;
    })
    .finally(() => {
      probeInFlight = null;
      updateSnapshot({
        isChecking: false,
        lastCheckedAt: Date.now(),
      });

      if (probeRequestedWhileInFlight) {
        probeRequestedWhileInFlight = false;
        triggerProbe();
      }
    });

  return probeInFlight;
};

const handleBrowserOnline = () => {
  setBrowserOnline(true);
  triggerProbe();
};

const handleBrowserOffline = () => {
  setBrowserOnline(false);
};

const handleVisibilityChange = () => {
  if (typeof document === "undefined" || document.hidden) return;
  triggerProbe();
};

const handleWindowFocus = () => {
  triggerProbe();
};

const ensureWindowListeners = () => {
  if (typeof window === "undefined" || hasWindowListeners) return;

  window.addEventListener("online", handleBrowserOnline);
  window.addEventListener("offline", handleBrowserOffline);
  hasWindowListeners = true;
};

const cleanupWindowListeners = () => {
  if (typeof window === "undefined" || !hasWindowListeners) return;

  window.removeEventListener("online", handleBrowserOnline);
  window.removeEventListener("offline", handleBrowserOffline);
  hasWindowListeners = false;
};

const ensureProbeListeners = () => {
  if (typeof window === "undefined" || hasProbeListeners) return;

  if (
    Number.isFinite(runtimeOptions.checkIntervalMs) &&
    runtimeOptions.checkIntervalMs > 0
  ) {
    probeIntervalId = window.setInterval(() => {
      triggerProbe();
    }, runtimeOptions.checkIntervalMs);
  }

  window.addEventListener("focus", handleWindowFocus);
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  hasProbeListeners = true;
  triggerProbe();
};

const cleanupProbeListeners = () => {
  if (typeof window === "undefined" || !hasProbeListeners) return;

  if (probeIntervalId !== null) {
    window.clearInterval(probeIntervalId);
    probeIntervalId = null;
  }

  window.removeEventListener("focus", handleWindowFocus);
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  hasProbeListeners = false;
};

const hasSnapshotListeners = (): boolean => listeners.size > 0;

const subscribe = (listener: OnlineStatusListener) => {
  ensureWindowListeners();
  ensureProbeListeners();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    if (!hasSnapshotListeners()) {
      cleanupWindowListeners();
      cleanupProbeListeners();
    }
  };
};

const getSnapshot = (): OnlineStatusSnapshot => snapshot;

const getServerSnapshot = (): OnlineStatusSnapshot => serverSnapshot;

export function useOnlineStatusSnapshot(
  options: UseOnlineStatusOptions = {},
): OnlineStatusSnapshot {
  const {
    checkIntervalMs,
    probeUrl,
    timeoutMs,
    probeMethod,
    probeRequestInit,
    resolveIsServerReachable,
  } = options;

  useEffect(() => {
    configureOnlineStatus({
      checkIntervalMs,
      probeUrl,
      timeoutMs,
      probeMethod,
      probeRequestInit,
      resolveIsServerReachable,
    });
  }, [
    checkIntervalMs,
    probeUrl,
    timeoutMs,
    probeMethod,
    probeRequestInit,
    resolveIsServerReachable,
  ]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Tracks browser/network reachability and returns app-facing online metadata.
 * @param options - Probe interval, URL and timeout settings.
 * @returns Online/offline status plus probe metadata.
 */
export function useOnlineStatus(
  options: UseOnlineStatusOptions = {},
): OnlineStatus {
  const snapshotValue = useOnlineStatusSnapshot(options);

  return {
    isOnline: snapshotValue.isOnline,
    isChecking: snapshotValue.isChecking,
    lastCheckedAt: snapshotValue.lastCheckedAt,
  };
}
