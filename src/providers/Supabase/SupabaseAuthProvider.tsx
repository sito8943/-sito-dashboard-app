import { useCallback, useEffect, useMemo, useRef } from "react";

import { AuthContext, useAuthSessionState } from "providers/Auth";
import type { SupabaseAuthProviderPropTypes } from "./types";
import { useSupabase } from "./SupabaseContext";

import { mapSupabaseSessionToSessionDto, SessionDto } from "lib";

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

  const {
    account,
    setAccount,
    clearStoredSession,
    isInGuestMode,
    setGuestMode,
    logUser: logUserBase,
  } = useAuthSessionState({
    guestMode,
    user,
    remember,
    refreshTokenKey,
    accessTokenExpiresAtKey,
  });

  const authRevisionRef = useRef(0);

  const bumpAuthRevision = useCallback(() => {
    authRevisionRef.current += 1;
  }, []);

  const clearSessionState = useCallback(() => {
    bumpAuthRevision();
    setAccount({});
    clearStoredSession();
  }, [bumpAuthRevision, clearStoredSession, setAccount]);

  const logUser = useCallback(
    (data: SessionDto, rememberMe?: boolean) => {
      if (!data) return;
      bumpAuthRevision();
      logUserBase(data, rememberMe);
    },
    [bumpAuthRevision, logUserBase],
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
