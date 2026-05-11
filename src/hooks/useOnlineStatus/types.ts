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

export type OnlineStatusSnapshot = {
  isBrowserOnline: boolean;
  isServerReachable: boolean;
  isOnline: boolean;
  isChecking: boolean;
  lastCheckedAt: number | null;
};

export type OnlineStatusListener = () => void;

export type ResolvedUseOnlineStatusOptions = {
  checkIntervalMs: number;
  probeUrl: string | null;
  timeoutMs: number;
  probeMethod: "HEAD" | "GET";
  probeRequestInit?: RequestInit | (() => RequestInit);
  resolveIsServerReachable: (response: Response) => boolean;
};
