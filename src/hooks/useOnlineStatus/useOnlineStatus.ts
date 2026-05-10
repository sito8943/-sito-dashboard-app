import { useOnlineStatusSnapshot } from "./useOnlineStatusSnapshot";

// types
import type { OnlineStatus, UseOnlineStatusOptions } from "./types";

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
