// types
import type {
  OnlineStatusListener,
  OnlineStatusSnapshot,
  UseOnlineStatusOptions,
} from "./types";

// utils
import { probeConnection, readNavigatorOnline, resolveOptions } from "./utils";

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

export const subscribeToOnlineStatusSnapshot = (
  listener: OnlineStatusListener,
) => {
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

export const getOnlineStatusSnapshot = (): OnlineStatusSnapshot => snapshot;

export const getServerOnlineStatusSnapshot = (): OnlineStatusSnapshot =>
  serverSnapshot;
