import {
  DEFAULT_CHECK_INTERVAL_MS,
  DEFAULT_PROBE_METHOD,
  DEFAULT_PROBE_URL,
  DEFAULT_RESOLVE_IS_SERVER_REACHABLE,
  DEFAULT_TIMEOUT_MS,
} from "./constants";
import type {
  ResolvedUseOnlineStatusOptions,
  UseOnlineStatusOptions,
} from "./types";

export const readNavigatorOnline = () =>
  typeof navigator === "undefined" ? true : navigator.onLine;

export const resolveOptions = (
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

export const withCacheBuster = (url: string) => {
  if (typeof window === "undefined") return url;

  try {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set("_ts", String(Date.now()));
    return parsed.toString();
  } catch {
    return url;
  }
};

export const readProbeRequestInit = (
  option: ResolvedUseOnlineStatusOptions["probeRequestInit"],
): RequestInit => {
  if (!option) return {};
  if (typeof option === "function") {
    return option();
  }
  return option;
};

export const probeConnection = async (
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
