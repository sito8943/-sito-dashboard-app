import { useCallback, useMemo } from "react";

// type
import { AuthProviderPropTypes } from "./types";
import { AuthContext } from "./authContext";
import { useAuthSessionState } from "./useAuthSessionState";

// hooks
import { useManager } from "../useManager";

// lib
import { fromLocal } from "lib";
import { isDefinitiveAuthSessionError } from "../../lib/api/authSessionError";

/**
 * Auth Provider
 * @param props - provider props
 * @returns  React component
 */
const AuthProvider = (props: AuthProviderPropTypes) => {
  const {
    children,
    guestMode = "guest_mode",
    user = "user",
    remember = "remember",
    refreshTokenKey = "refreshToken",
    accessTokenExpiresAtKey = "accessTokenExpiresAt",
  } = props;

  const manager = useManager();

  const {
    account,
    setAccount,
    clearStoredSession,
    isInGuestMode,
    setGuestMode,
    logUser,
  } = useAuthSessionState({
    guestMode,
    user,
    remember,
    refreshTokenKey,
    accessTokenExpiresAtKey,
  });

  const logoutUser = useCallback(async () => {
    const accessToken = fromLocal(user) ?? account.token;
    const refreshToken =
      fromLocal(refreshTokenKey) ??
      (typeof account.refreshToken === "string"
        ? account.refreshToken
        : undefined);

    try {
      await manager.Auth.logout({
        accessToken,
        refreshToken,
      });
    } catch (err) {
      console.error(err);
    }
    setAccount({});
    clearStoredSession();
  }, [
    account.refreshToken,
    account.token,
    clearStoredSession,
    manager.Auth,
    refreshTokenKey,
    setAccount,
    user,
  ]);

  const logUserFromLocal = useCallback(async () => {
    try {
      const authDto = await manager.Auth.getSession();
      logUser(authDto);
    } catch (err) {
      console.error(err);
      if (isDefinitiveAuthSessionError(err)) await logoutUser();
    }
  }, [logUser, logoutUser, manager.Auth]);

  const value = useMemo(() => {
    return {
      account,
      logUser,
      logoutUser,
      logUserFromLocal,
      isInGuestMode,
      setGuestMode,
    };
  }, [
    account,
    logUser,
    logoutUser,
    logUserFromLocal,
    isInGuestMode,
    setGuestMode,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
