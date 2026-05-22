import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { SupabaseAuthClient } from "./SupabaseAuthClient";

const ok = { error: null };

const makeSession = (overrides: Partial<Session> = {}): Session =>
  ({
    access_token: "atk",
    refresh_token: "rtk",
    expires_at: 2_000_000_000,
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "42",
      email: "u@mail.com",
      user_metadata: { username: "sito" },
      app_metadata: {},
      aud: "authenticated",
      created_at: "2026-01-01",
    },
    ...overrides,
  }) as unknown as Session;

const makeSupabase = () => {
  const session = makeSession();
  const signInWithPassword = vi
    .fn()
    .mockResolvedValue({ data: { session, user: session.user }, error: null });
  const refreshSession = vi
    .fn()
    .mockResolvedValue({ data: { session, user: session.user }, error: null });
  const signUp = vi
    .fn()
    .mockResolvedValue({ data: { session, user: session.user }, error: null });
  const getSession = vi
    .fn()
    .mockResolvedValue({ data: { session }, error: null });
  const signOut = vi.fn().mockResolvedValue(ok);

  const supabase = {
    auth: {
      signInWithPassword,
      refreshSession,
      signUp,
      getSession,
      signOut,
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    session,
    spies: { signInWithPassword, refreshSession, signUp, getSession, signOut },
  };
};

describe("SupabaseAuthClient", () => {
  it("login maps session via default mapper", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);

    const result = await client.login({
      email: "u@mail.com",
      password: "p",
      rememberMe: true,
    });

    expect(spies.signInWithPassword).toHaveBeenCalledWith({
      email: "u@mail.com",
      password: "p",
    });
    expect(result.token).toBe("atk");
    expect(result.refreshToken).toBe("rtk");
    expect(result.username).toBe("sito");
  });

  it("login throws on Supabase error", async () => {
    const { supabase, spies } = makeSupabase();
    spies.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: new Error("bad creds"),
    });
    const client = new SupabaseAuthClient(supabase);

    await expect(
      client.login({ email: "u@mail.com", password: "p", rememberMe: false }),
    ).rejects.toThrow("bad creds");
  });

  it("login throws when no session returned", async () => {
    const { supabase, spies } = makeSupabase();
    spies.signInWithPassword.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: null,
    });
    const client = new SupabaseAuthClient(supabase);

    await expect(
      client.login({ email: "u@mail.com", password: "p", rememberMe: false }),
    ).rejects.toThrow("Authenticated session not found");
  });

  it("refresh calls refreshSession with refresh token", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);

    const result = await client.refresh({ refreshToken: "rtk" });

    expect(spies.refreshSession).toHaveBeenCalledWith({ refresh_token: "rtk" });
    expect(result.token).toBe("atk");
  });

  it("getSession returns mapped session", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);

    await client.getSession();
    expect(spies.getSession).toHaveBeenCalledTimes(1);
  });

  it("getSession throws when no active session", async () => {
    const { supabase, spies } = makeSupabase();
    spies.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const client = new SupabaseAuthClient(supabase);

    await expect(client.getSession()).rejects.toThrow("No active session");
  });

  it("logout calls signOut", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);
    await client.logout();
    expect(spies.signOut).toHaveBeenCalledTimes(1);
  });

  it("signUp returns authenticated when session present", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);

    const result = await client.signUp({
      email: "u@mail.com",
      password: "p",
      rPassword: "p",
      name: "Sito",
      redirectTo: "https://app.test/confirm",
    });

    expect(result.status).toBe("authenticated");
    expect(spies.signUp).toHaveBeenCalledWith({
      email: "u@mail.com",
      password: "p",
      options: {
        emailRedirectTo: "https://app.test/confirm",
        data: { name: "Sito", username: "Sito" },
      },
    });
  });

  it("signUp returns confirmation_required when no session", async () => {
    const { supabase, spies } = makeSupabase();
    spies.signUp.mockResolvedValueOnce({
      data: { session: null, user: { id: "42" } },
      error: null,
    });
    const client = new SupabaseAuthClient(supabase);

    const result = await client.signUp({
      email: "u@mail.com",
      password: "p",
      rPassword: "p",
    });

    expect(result).toEqual({
      status: "confirmation_required",
      email: "u@mail.com",
    });
  });

  it("signUp resolves name from name -> username -> email fallback chain", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);

    await client.signUp({
      email: "u@mail.com",
      password: "p",
      rPassword: "p",
      username: "fallback-user",
    });
    expect(spies.signUp.mock.calls[0][0].options.data).toEqual({
      name: "fallback-user",
      username: "fallback-user",
    });

    spies.signUp.mockClear();
    await client.signUp({
      email: "u@mail.com",
      password: "p",
      rPassword: "p",
    });
    expect(spies.signUp.mock.calls[0][0].options.data).toEqual({
      name: "u@mail.com",
      username: "u@mail.com",
    });
  });

  it("signUp accepts custom metadata overriding defaults", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);

    await client.signUp({
      email: "u@mail.com",
      password: "p",
      rPassword: "p",
      metadata: { plan: "pro", role: "admin" },
    });

    expect(spies.signUp.mock.calls[0][0].options.data).toEqual({
      plan: "pro",
      role: "admin",
    });
  });

  it("signUp uses defaultSignUpRedirectTo when call omits it", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthClient(supabase, {
      defaultSignUpRedirectTo: "https://app.test/default",
    });

    await client.signUp({
      email: "u@mail.com",
      password: "p",
      rPassword: "p",
    });

    expect(spies.signUp.mock.calls[0][0].options.emailRedirectTo).toBe(
      "https://app.test/default",
    );
  });

  it("register throws on confirmation_required", async () => {
    const { supabase, spies } = makeSupabase();
    spies.signUp.mockResolvedValueOnce({
      data: { session: null, user: { id: "42" } },
      error: null,
    });
    const client = new SupabaseAuthClient(supabase);

    await expect(
      client.register({ email: "u@mail.com", password: "p", rPassword: "p" }),
    ).rejects.toThrow("Email confirmation required");
  });

  it("register returns session on authenticated", async () => {
    const { supabase } = makeSupabase();
    const client = new SupabaseAuthClient(supabase);
    const session = await client.register({
      email: "u@mail.com",
      password: "p",
      rPassword: "p",
    });
    expect(session.token).toBe("atk");
  });

  it("uses custom sessionMapper when provided", async () => {
    const { supabase } = makeSupabase();
    const sessionMapper = vi.fn().mockReturnValue({
      id: 99,
      username: "custom",
      email: "custom@mail.com",
      token: "custom-token",
      refreshToken: "custom-refresh",
      accessTokenExpiresAt: null,
    });
    const client = new SupabaseAuthClient(supabase, { sessionMapper });

    const result = await client.login({
      email: "u@mail.com",
      password: "p",
      rememberMe: false,
    });

    expect(sessionMapper).toHaveBeenCalledTimes(1);
    expect(result.token).toBe("custom-token");
  });
});
