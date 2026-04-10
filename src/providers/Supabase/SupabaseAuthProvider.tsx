import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AuthContext } from "providers/Auth";
import type { SupabaseAuthProviderPropTypes } from "./types";
import { useSupabase } from "./SupabaseContext";

import {
  fromLocal,
  mapSupabaseSessionToSessionDto,
  removeFromLocal,
  SessionDto,
  toLocal,
} from "lib";

const SupabaseAuthProvider = (props: SupabaseAuthProviderPropTypes) => {
  const {
    children,
    guestMode = "guest_mode",
    user = "user",
    remember = "remember",
    refreshTokenKey = "refreshToken",
    accessTokenExpiresAtKey = "accessTokenExpiresAt",
    sessionMapper,
  } = props;

  const supabase = useSupabase();
  const mapperRef = useRef(sessionMapper ?? mapSupabaseSessionToSessionDto);

  useEffect(() => {
    mapperRef.current = sessionMapper ?? mapSupabaseSessionToSessionDto;
  }, [sessionMapper]);

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
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }

    setAccount({} as SessionDto);
    clearStoredSession();
  }, [clearStoredSession, supabase.auth]);

  const logUserFromLocal = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!data.session) {
        setAccount({} as SessionDto);
        clearStoredSession();
        return;
      }

      logUser(mapperRef.current(data.session));
    } catch (err) {
      console.error(err);
      await logoutUser();
    }
  }, [clearStoredSession, logUser, logoutUser, supabase.auth]);

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      if (!mounted) return;
      await logUserFromLocal();
    };

    bootstrapSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session) {
        setAccount({} as SessionDto);
        clearStoredSession();
        return;
      }

      logUser(mapperRef.current(session));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [clearStoredSession, logUser, logUserFromLocal, supabase.auth]);

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

export { SupabaseAuthProvider };
