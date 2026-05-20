import { useCallback, useState } from "react";

import {
  fromLocal,
  removeFromLocal,
  toLocal,
  SessionAccountDto,
  SessionDto,
} from "lib";

export interface AuthSessionStateKeys {
  guestMode?: string;
  user?: string;
  remember?: string;
  refreshTokenKey?: string;
  accessTokenExpiresAtKey?: string;
}

export interface ResolvedAuthSessionStateKeys {
  guestMode: string;
  user: string;
  remember: string;
  refreshTokenKey: string;
  accessTokenExpiresAtKey: string;
}

export interface AuthSessionState {
  account: SessionAccountDto;
  setAccount: (next: SessionAccountDto) => void;
  storageKeys: ResolvedAuthSessionStateKeys;
  clearStoredSession: () => void;
  isInGuestMode: () => boolean;
  setGuestMode: (value: boolean) => void;
  logUser: (data: SessionDto, rememberMe?: boolean) => void;
}

/**
 * Shared session-state hook for `AuthProvider` and `SupabaseAuthProvider`.
 * Centralizes localStorage key resolution + identical `account` / `logUser` /
 * guest-mode behavior. Each provider supplies its own `logoutUser` /
 * `logUserFromLocal` because the backend call differs.
 */
export const useAuthSessionState = (
  keys: AuthSessionStateKeys = {},
): AuthSessionState => {
  const {
    guestMode = "guest_mode",
    user = "user",
    remember = "remember",
    refreshTokenKey = "refreshToken",
    accessTokenExpiresAtKey = "accessTokenExpiresAt",
  } = keys;

  const [account, setAccount] = useState<SessionAccountDto>({});

  const clearStoredSession = useCallback(() => {
    removeFromLocal(user);
    removeFromLocal(remember);
    removeFromLocal(refreshTokenKey);
    removeFromLocal(accessTokenExpiresAtKey);
  }, [accessTokenExpiresAtKey, refreshTokenKey, remember, user]);

  const isInGuestMode = useCallback(() => {
    return !!fromLocal(guestMode, "boolean") && account.token === undefined;
  }, [account.token, guestMode]);

  const setGuestMode = useCallback(
    (value: boolean) => {
      toLocal(guestMode, value);
    },
    [guestMode],
  );

  const logUser = useCallback(
    (data: SessionDto, rememberMe?: boolean) => {
      if (!data) return;

      const storedRemember = fromLocal(remember, "boolean");
      const resolvedRemember =
        rememberMe ??
        (typeof storedRemember === "boolean" ? storedRemember : false);

      setAccount(data);
      removeFromLocal(guestMode);
      toLocal(user, data.token);
      toLocal(remember, resolvedRemember);

      if (typeof data.refreshToken === "string" && data.refreshToken.length)
        toLocal(refreshTokenKey, data.refreshToken);
      else removeFromLocal(refreshTokenKey);

      if (
        typeof data.accessTokenExpiresAt === "string" &&
        data.accessTokenExpiresAt.length
      )
        toLocal(accessTokenExpiresAtKey, data.accessTokenExpiresAt);
      else removeFromLocal(accessTokenExpiresAtKey);
    },
    [accessTokenExpiresAtKey, guestMode, refreshTokenKey, remember, user],
  );

  return {
    account,
    setAccount,
    storageKeys: {
      guestMode,
      user,
      remember,
      refreshTokenKey,
      accessTokenExpiresAtKey,
    },
    clearStoredSession,
    isInGuestMode,
    setGuestMode,
    logUser,
  };
};
