import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { SupabaseAuthApiClient } from "./SupabaseAuthApiClient";

const ok = { error: null };

const makeSupabase = () => {
  const resetPasswordForEmail = vi.fn().mockResolvedValue(ok);
  const resend = vi.fn().mockResolvedValue(ok);
  const verifyOtp = vi.fn().mockResolvedValue(ok);
  const signOut = vi.fn().mockResolvedValue(ok);
  const setSession = vi.fn().mockResolvedValue(ok);
  const updateUser = vi.fn().mockResolvedValue(ok);
  const getSession = vi.fn().mockResolvedValue({
    data: { session: { access_token: "tok" } },
    error: null,
  });

  const supabase = {
    auth: {
      resetPasswordForEmail,
      resend,
      verifyOtp,
      signOut,
      setSession,
      updateUser,
      getSession,
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    spies: {
      resetPasswordForEmail,
      resend,
      verifyOtp,
      signOut,
      setSession,
      updateUser,
      getSession,
    },
  };
};

describe("SupabaseAuthApiClient", () => {
  it("forgotPassword calls resetPasswordForEmail with redirectTo when provided", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthApiClient(supabase);

    await client.forgotPassword({
      email: "u@mail.com",
      redirectTo: "https://app.test/reset",
    });

    expect(spies.resetPasswordForEmail).toHaveBeenCalledWith("u@mail.com", {
      redirectTo: "https://app.test/reset",
    });
  });

  it("forgotPassword omits options when redirectTo is missing", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthApiClient(supabase);

    await client.forgotPassword({ email: "u@mail.com" });
    expect(spies.resetPasswordForEmail).toHaveBeenCalledWith(
      "u@mail.com",
      undefined,
    );
  });

  it("forgotPassword throws on Supabase error", async () => {
    const { supabase, spies } = makeSupabase();
    spies.resetPasswordForEmail.mockResolvedValueOnce({
      error: new Error("x"),
    });
    const client = new SupabaseAuthApiClient(supabase);

    await expect(
      client.forgotPassword({ email: "u@mail.com" }),
    ).rejects.toThrow("x");
  });

  it("resendConfirmEmail uses signup type and forwards emailRedirectTo", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthApiClient(supabase);

    await client.resendConfirmEmail({
      email: "u@mail.com",
      redirectTo: "https://app.test/confirm",
    });

    expect(spies.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "u@mail.com",
      options: { emailRedirectTo: "https://app.test/confirm" },
    });
  });

  it("confirmEmail verifies OTP then signs out", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthApiClient(supabase);

    await client.confirmEmail({ tokenHash: "h", type: "email" });

    expect(spies.verifyOtp).toHaveBeenCalledWith({
      token_hash: "h",
      type: "email",
    });
    expect(spies.signOut).toHaveBeenCalledTimes(1);
  });

  it("resetPassword via tokenHash: verify, update, sign out", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthApiClient(supabase);

    await client.resetPassword({
      tokenHash: "h",
      type: "recovery",
      newPassword: "newpass",
    });

    expect(spies.verifyOtp).toHaveBeenCalledWith({
      token_hash: "h",
      type: "recovery",
    });
    expect(spies.setSession).not.toHaveBeenCalled();
    expect(spies.updateUser).toHaveBeenCalledWith({ password: "newpass" });
    expect(spies.signOut).toHaveBeenCalledTimes(1);
  });

  it("resetPassword via access token: setSession, update, sign out", async () => {
    const { supabase, spies } = makeSupabase();
    const client = new SupabaseAuthApiClient(supabase);

    await client.resetPassword({
      accessToken: "atk",
      refreshToken: "rtk",
      newPassword: "newpass",
    });

    expect(spies.setSession).toHaveBeenCalledWith({
      access_token: "atk",
      refresh_token: "rtk",
    });
    expect(spies.updateUser).toHaveBeenCalledWith({ password: "newpass" });
    expect(spies.signOut).toHaveBeenCalledTimes(1);
  });

  it("resetPassword via access token requires refreshToken", async () => {
    const { supabase } = makeSupabase();
    const client = new SupabaseAuthApiClient(supabase);

    await expect(
      client.resetPassword({ accessToken: "atk", newPassword: "p" }),
    ).rejects.toThrow(/refreshToken is required/);
  });

  it("resetPassword throws if no active session after verify", async () => {
    const { supabase, spies } = makeSupabase();
    spies.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });
    const client = new SupabaseAuthApiClient(supabase);

    await expect(
      client.resetPassword({
        tokenHash: "h",
        type: "recovery",
        newPassword: "p",
      }),
    ).rejects.toThrow("No active session");
  });
});
