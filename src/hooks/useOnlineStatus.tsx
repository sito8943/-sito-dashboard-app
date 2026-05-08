import { useCallback, useEffect, useRef, useState } from "react";

export type OnlineStatus = {
  isOnline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
};

export type UseOnlineStatusOptions = {
  checkIntervalMs?: number;
  probeUrl?: string;
  timeoutMs?: number;
};

const DEFAULT_CHECK_INTERVAL_MS = 30000;
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_PROBE_URL = "/";

const readNavigatorOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

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

const probeConnection = async (
  probeUrl: string,
  timeoutMs: number,
): Promise<boolean> => {
  if (typeof fetch !== "function") return readNavigatorOnline();

  const hasAbortController = typeof AbortController !== "undefined";
  const controller = hasAbortController ? new AbortController() : null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    if (controller) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    }

    const response = await fetch(withCacheBuster(probeUrl), {
      method: "HEAD",
      cache: "no-store",
      signal: controller?.signal,
    });

    if (response.ok || response.status === 405) return true;
    return false;
  } catch {
    return false;
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
};

/**
 * Tracks browser connectivity and periodically probes a URL to verify reachability.
 * @param options - Probe interval, URL and timeout settings.
 * @returns Online/offline status plus probe metadata.
 */
export function useOnlineStatus(
  options: UseOnlineStatusOptions = {},
): OnlineStatus {
  const {
    checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS,
    probeUrl = DEFAULT_PROBE_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const [status, setStatus] = useState<OnlineStatus>(() => ({
    isOnline: readNavigatorOnline(),
    isChecking: false,
    lastCheckedAt: null,
  }));
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const checkConnectivity = useCallback(async () => {
    if (!readNavigatorOnline()) {
      requestIdRef.current += 1;
      setStatus({
        isOnline: false,
        isChecking: false,
        lastCheckedAt: Date.now(),
      });
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    setStatus((current) => ({
      ...current,
      isChecking: true,
    }));

    const isReachable = await probeConnection(probeUrl, timeoutMs);

    if (!mountedRef.current || requestId !== requestIdRef.current) return;

    setStatus({
      isOnline: isReachable,
      isChecking: false,
      lastCheckedAt: Date.now(),
    });
  }, [probeUrl, timeoutMs]);

  useEffect(() => {
    mountedRef.current = true;

    const handleOffline = () => {
      requestIdRef.current += 1;
      setStatus({
        isOnline: false,
        isChecking: false,
        lastCheckedAt: Date.now(),
      });
    };

    const handleOnline = () => {
      void checkConnectivity();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    const initialCheckTimeoutId = window.setTimeout(() => {
      void checkConnectivity();
    }, 0);

    const shouldPoll = Number.isFinite(checkIntervalMs) && checkIntervalMs > 0;
    const intervalId = shouldPoll
      ? window.setInterval(() => {
          void checkConnectivity();
        }, checkIntervalMs)
      : null;

    return () => {
      mountedRef.current = false;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.clearTimeout(initialCheckTimeoutId);
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [checkConnectivity, checkIntervalMs]);

  return status;
}
