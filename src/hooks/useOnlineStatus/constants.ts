import type { ResolvedUseOnlineStatusOptions } from "./types";

export const DEFAULT_CHECK_INTERVAL_MS = 30000;
export const DEFAULT_TIMEOUT_MS = 5000;
export const DEFAULT_PROBE_URL: string | null = "/";
export const DEFAULT_PROBE_METHOD: "HEAD" | "GET" = "HEAD";

export const DEFAULT_RESOLVE_IS_SERVER_REACHABLE: ResolvedUseOnlineStatusOptions["resolveIsServerReachable"] =
  (response) => response.ok || response.status === 405;
