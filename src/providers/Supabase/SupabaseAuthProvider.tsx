import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AuthContext } from "providers/Auth";
import type { SupabaseAuthProviderPropTypes } from "./types";
import { useSupabase } from "./SupabaseContext";

import {
  fromLocal,
  mapSupabaseSessionToSessionDto,
  removeFromLocal,
  SessionAccountDto,
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

  const [account, setAccount] = useState<SessionAccountDto>({});
  const authRevisionRef = useRef(0);

  const clearStoredSession = useCallback(() => {
    removeFromLocal(user);
    removeFromLocal(remember);
    removeFromLocal(refreshTokenKey);
    removeFromLocal(accessTokenExpiresAtKey);
  }, [accessTokenExpiresAtKey, refreshTokenKey, remember, user]);

  const bumpAuthRevision = useCallback(() => {
    authRevisionRef.current += 1;
  }, []);

  const clearSessionState = useCallback(() => {
    bumpAuthRevision();
    setAccount({});
    clearStoredSession();
  }, [bumpAuthRevision, clearStoredSession]);

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

      bumpAuthRevision();

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
    [
      accessTokenExpiresAtKey,
      bumpAuthRevision,
      guestMode,
      refreshTokenKey,
      remember,
      user,
    ],
  );

  const logoutUser = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }

    clearSessionState();
  }, [clearSessionState, supabase.auth]);

  const logUserFromLocal = useCallback(async () => {
    const requestRevision = authRevisionRef.current;

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      // Ignore stale bootstrap/read responses when a newer auth mutation
      // (SIGN_IN/SIGN_OUT/manual logUser) already updated the state.
      if (requestRevision !== authRevisionRef.current) return;

      if (!data.session) {
        clearSessionState();
        return;
      }

      logUser(mapperRef.current(data.session));
    } catch (err) {
      console.error(err);
      if (requestRevision !== authRevisionRef.current) return;
      await logoutUser();
    }
  }, [clearSessionState, logUser, logoutUser, supabase.auth]);

  useEffect(() => {
    let mounted = true;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session) {
        clearSessionState();
        return;
      }

      logUser(mapperRef.current(session));
    });

    const bootstrapSession = async () => {
      if (!mounted) return;
      await logUserFromLocal();
    };

    void bootstrapSession();

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [clearSessionState, logUser, logUserFromLocal, supabase.auth]);

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
