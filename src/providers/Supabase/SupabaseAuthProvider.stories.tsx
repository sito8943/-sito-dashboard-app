import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { mapSupabaseSessionToSessionDto } from "lib";
import { useAuth } from "providers/Auth";

import { SupabaseAuthProvider } from "./SupabaseAuthProvider";
import { SupabaseManagerProvider } from "./SupabaseManagerProvider";

type SupabaseRaceConfig = {
  bootstrapDelayMs: number;
  signInDelayMs: number;
  authEventDelayMs: number;
  forceInitialNullSession: boolean;
  emitSignedInAuthEvent: boolean;
};

type EventState = {
  sequence: number;
  events: string[];
};

type EventAction = { type: "push"; event: string } | { type: "reset" };

const AUTH_STORAGE_KEYS = [
  "user",
  "remember",
  "refreshToken",
  "accessTokenExpiresAt",
  "guest_mode",
] as const;

const wait = (ms: number) => {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
};

const clearAuthStorage = () => {
  for (const key of AUTH_STORAGE_KEYS) window.localStorage.removeItem(key);
};

const EVENT_HISTORY_LIMIT = 24;

const eventReducer = (state: EventState, action: EventAction): EventState => {
  if (action.type === "reset") return { sequence: 0, events: [] };

  const nextSequence = state.sequence + 1;
  const sequence = String(nextSequence).padStart(2, "0");
  const timelineEntry = `${sequence}. ${action.event}`;

  return {
    sequence: nextSequence,
    events: [timelineEntry, ...state.events].slice(0, EVENT_HISTORY_LIMIT),
  };
};

const createSession = (
  tokenSeed: number,
  email = "period-calendar@sito.dev",
): Session => {
  return {
    access_token: `access-token-${tokenSeed}`,
    refresh_token: `refresh-token-${tokenSeed}`,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: String(tokenSeed),
      email,
      user_metadata: {
        username: "period-calendar-user",
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: "2024-01-01T00:00:00.000Z",
    },
  } as unknown as Session;
};

const createSupabaseRaceClient = (
  config: SupabaseRaceConfig,
  pushEvent: (event: string) => void,
  seed: number,
): SupabaseClient => {
  void seed;
  let storedSession: Session | null = null;
  let shouldReturnNullOnce = config.forceInitialNullSession;
  const listeners = new Set<(event: string, session: Session | null) => void>();

  const emitAuthEvent = (event: string, session: Session | null) => {
    for (const listener of listeners) listener(event, session);
  };

  return {
    auth: {
      async getSession() {
        pushEvent("auth.getSession() called");
        await wait(config.bootstrapDelayMs);

        if (shouldReturnNullOnce) {
          shouldReturnNullOnce = false;
          pushEvent("auth.getSession() -> null (forced first read)");
          return { data: { session: null }, error: null };
        }

        pushEvent(`auth.getSession() -> ${storedSession ? "session" : "null"}`);
        return { data: { session: storedSession }, error: null };
      },
      async signInWithPassword(credentials: {
        email: string;
        password: string;
      }) {
        pushEvent(`auth.signInWithPassword(${credentials.email})`);
        await wait(config.signInDelayMs);

        storedSession = createSession(Date.now(), credentials.email);
        pushEvent("auth.signInWithPassword() -> session persisted");

        if (config.emitSignedInAuthEvent) {
          window.setTimeout(() => {
            pushEvent("auth.onAuthStateChange() -> SIGNED_IN");
            emitAuthEvent("SIGNED_IN", storedSession);
          }, config.authEventDelayMs);
        } else {
          pushEvent("SIGNED_IN auth event emission disabled");
        }

        return {
          data: { session: storedSession, user: storedSession.user },
          error: null,
        };
      },
      async signOut() {
        pushEvent("auth.signOut()");
        storedSession = null;
        emitAuthEvent("SIGNED_OUT", null);
        return { error: null };
      },
      onAuthStateChange(
        callback: (event: string, session: Session | null) => void,
      ) {
        listeners.add(callback);
        pushEvent("auth.onAuthStateChange() subscribed");
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners.delete(callback);
                pushEvent("auth.onAuthStateChange() unsubscribed");
              },
            },
          },
        };
      },
    },
  } as unknown as SupabaseClient;
};

type RaceSimulatorPanelProps = {
  supabase: SupabaseClient;
  events: string[];
  onSimulateReload: () => void;
  onResetScenario: () => void;
};

const RaceSimulatorPanel = ({
  supabase,
  events,
  onSimulateReload,
  onResetScenario,
}: RaceSimulatorPanelProps) => {
  const { account, logUser, logoutUser } = useAuth();
  const [status, setStatus] = useState("Idle");
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setBusy(true);
    setStatus("Calling signInWithPassword...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: "period-calendar@sito.dev",
      password: "demo-password",
    });

    if (error) {
      setStatus(`signInWithPassword failed: ${error.message}`);
      setBusy(false);
      return;
    }

    if (!data.session) {
      setStatus("signInWithPassword returned null session");
      setBusy(false);
      return;
    }

    logUser(mapSupabaseSessionToSessionDto(data.session), true);
    setStatus("signInWithPassword resolved + logUser() executed");
    setBusy(false);
  };

  const handleLogout = async () => {
    setBusy(true);
    await logoutUser();
    setStatus("logoutUser() executed");
    setBusy(false);
  };

  const user = window.localStorage.getItem("user");
  const refreshToken = window.localStorage.getItem("refreshToken");
  const remember = window.localStorage.getItem("remember");

  return (
    <div className="max-w-4xl space-y-4 rounded-lg border border-base/20 p-4">
      <p className="text-sm opacity-80">
        This simulates the period-calendar flow: submit calls
        <code className="mx-1">signInWithPassword</code>
        and then
        <code className="mx-1">logUser</code>
        while
        <code className="mx-1">SupabaseAuthProvider</code>
        also runs
        <code className="mx-1">getSession()</code>
        on mount.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          className="button submit primary"
          onClick={() => void handleSignIn()}
          disabled={busy}
        >
          Submit sign in
        </button>
        <button
          className="button outlined"
          onClick={() => void handleLogout()}
          disabled={busy}
        >
          Logout
        </button>
        <button className="button outlined" onClick={onSimulateReload}>
          Simulate F5 (remount provider)
        </button>
        <button className="button outlined" onClick={onResetScenario}>
          Reset scenario
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded border border-base/20 p-3 text-sm">
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>account.token:</strong> {account.token ?? "undefined"}
          </p>
          <p>
            <strong>localStorage.user:</strong> {user ?? "null"}
          </p>
          <p>
            <strong>localStorage.refreshToken:</strong> {refreshToken ?? "null"}
          </p>
          <p>
            <strong>localStorage.remember:</strong> {remember ?? "null"}
          </p>
        </div>
        <div className="rounded border border-base/20 p-3 text-sm">
          <p className="mb-2 font-semibold">Event timeline</p>
          <ul className="max-h-52 space-y-1 overflow-auto font-mono text-xs">
            {events.length ? (
              events.map((event) => <li key={event}>{event}</li>)
            ) : (
              <li>No events yet</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const SupabaseAuthRaceStory = (props: SupabaseRaceConfig) => {
  const {
    bootstrapDelayMs,
    signInDelayMs,
    authEventDelayMs,
    forceInitialNullSession,
    emitSignedInAuthEvent,
  } = props;

  const [providerKey, setProviderKey] = useState(0);
  const [clientSeed, setClientSeed] = useState(0);
  const [eventState, dispatchEvent] = useReducer(eventReducer, {
    sequence: 0,
    events: [],
  });

  const pushEvent = useCallback((event: string) => {
    dispatchEvent({ type: "push", event });
  }, []);

  useEffect(() => {
    clearAuthStorage();
  }, []);

  const supabase = useMemo(() => {
    return createSupabaseRaceClient(
      {
        bootstrapDelayMs,
        signInDelayMs,
        authEventDelayMs,
        forceInitialNullSession,
        emitSignedInAuthEvent,
      },
      pushEvent,
      clientSeed,
    );
  }, [
    clientSeed,
    authEventDelayMs,
    bootstrapDelayMs,
    emitSignedInAuthEvent,
    forceInitialNullSession,
    signInDelayMs,
    pushEvent,
  ]);

  const remountProvider = useCallback(() => {
    pushEvent("manual remount requested");
    setProviderKey((current) => current + 1);
  }, [pushEvent]);

  const resetScenario = useCallback(() => {
    clearAuthStorage();
    dispatchEvent({ type: "reset" });
    setClientSeed((current) => current + 1);
    setProviderKey((current) => current + 1);
  }, []);

  return (
    <SupabaseManagerProvider supabase={supabase}>
      <SupabaseAuthProvider key={providerKey}>
        <RaceSimulatorPanel
          supabase={supabase}
          events={eventState.events}
          onSimulateReload={remountProvider}
          onResetScenario={resetScenario}
        />
      </SupabaseAuthProvider>
    </SupabaseManagerProvider>
  );
};

const meta = {
  title: "Providers/Supabase/SupabaseAuthProvider",
  component: SupabaseAuthRaceStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    forceInitialNullSession: true,
    emitSignedInAuthEvent: false,
    bootstrapDelayMs: 1100,
    signInDelayMs: 150,
    authEventDelayMs: 1200,
  },
  argTypes: {
    bootstrapDelayMs: { control: { type: "number", min: 0, step: 50 } },
    signInDelayMs: { control: { type: "number", min: 0, step: 50 } },
    authEventDelayMs: { control: { type: "number", min: 0, step: 50 } },
    forceInitialNullSession: { control: "boolean" },
    emitSignedInAuthEvent: { control: "boolean" },
  },
} satisfies Meta<typeof SupabaseAuthRaceStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RaceReproduction: Story = {
  name: "Race Reproduction (No SIGNED_IN Event)",
};

export const WithAuthEventRecovery: Story = {
  name: "Control Case (SIGNED_IN Event Enabled)",
  args: {
    emitSignedInAuthEvent: true,
  },
};
