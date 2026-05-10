import { useEffect, useSyncExternalStore } from "react";

import {
  configureOnlineStatus,
  getOnlineStatusSnapshot,
  getServerOnlineStatusSnapshot,
  subscribeToOnlineStatusSnapshot,
} from "./state";

// types
import type { OnlineStatusSnapshot, UseOnlineStatusOptions } from "./types";

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

  return useSyncExternalStore(
    subscribeToOnlineStatusSnapshot,
    getOnlineStatusSnapshot,
    getServerOnlineStatusSnapshot,
  );
}
