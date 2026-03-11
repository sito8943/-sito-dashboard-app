import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// type
import { AuthProviderContextType, AuthProviderPropTypes } from "./types";

// providers
import { useManager } from "./ManagerProvider";

// lib
import { toLocal, removeFromLocal, fromLocal, SessionDto } from "lib";

const AuthContext = createContext<AuthProviderContextType | undefined>(
  undefined,
);

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

  const [account, setAccount] = useState<SessionDto>({} as SessionDto);

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

  const logoutUser = useCallback(async () => {
    const accessToken =
      (fromLocal(user) as string | undefined) ?? account.token;
    const refreshToken =
      (fromLocal(refreshTokenKey) as string | undefined) ??
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
    setAccount({} as SessionDto);
    clearStoredSession();
  }, [
    account.refreshToken,
    account.token,
    clearStoredSession,
    manager.Auth,
    refreshTokenKey,
    user,
  ]);

  const logUserFromLocal = useCallback(async () => {
    try {
      const authDto = await manager.Auth.getSession();
      logUser(authDto);
    } catch (err) {
      console.error(err);
      logoutUser();
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

/**
 * useAuth hook
 * @returns Provider
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("authContext must be used within a Provider");
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuth };
