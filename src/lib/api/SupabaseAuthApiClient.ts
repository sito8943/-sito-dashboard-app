import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";

import type {
  ConfirmEmailDto,
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  ResetPasswordDto,
} from "../entities";
import type { IAuthApiClient } from "./IAuthApiClient";

/**
 * Supabase adapter for {@link IAuthApiClient}. Maps DTOs onto
 * `supabase.auth.resetPasswordForEmail`, `auth.resend`, `auth.verifyOtp`
 * (+ `auth.setSession` for the access-token reset path).
 *
 * `confirmEmail` and `resetPassword` call `auth.signOut()` after verification
 * so the temporary recovery session does not persist.
 */
export class SupabaseAuthApiClient implements IAuthApiClient {
  constructor(private readonly supabase: SupabaseClient) {}

  async forgotPassword(data: ForgotPasswordDto): Promise<void> {
    const redirectTo = data.redirectTo?.trim();
    const { error } = await this.supabase.auth.resetPasswordForEmail(
      data.email,
      redirectTo ? { redirectTo } : undefined,
    );
    if (error) throw error;
  }

  async resendConfirmEmail(data: ResendConfirmEmailDto): Promise<void> {
    const redirectTo = data.redirectTo?.trim();
    const { error } = await this.supabase.auth.resend({
      type: "signup",
      email: data.email,
      options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
    });
    if (error) throw error;
  }

  async confirmEmail(data: ConfirmEmailDto): Promise<void> {
    const { error } = await this.supabase.auth.verifyOtp({
      token_hash: data.tokenHash,
      type: data.type as EmailOtpType,
    });
    if (error) throw error;
    await this.supabase.auth.signOut();
  }

  async resetPassword(data: ResetPasswordDto): Promise<void> {
    if ("tokenHash" in data) {
      const { error } = await this.supabase.auth.verifyOtp({
        token_hash: data.tokenHash,
        type: data.type as EmailOtpType,
      });
      if (error) throw error;
    } else {
      if (!data.refreshToken) {
        throw new Error(
          "SupabaseAuthApiClient.resetPassword: refreshToken is required when using the access-token path.",
        );
      }
      const { error } = await this.supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      });
      if (error) throw error;
    }

    const { data: sessionData, error: sessionError } =
      await this.supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) throw new Error("No active session");

    const { error: updateError } = await this.supabase.auth.updateUser({
      password: data.newPassword,
    });
    if (updateError) throw updateError;

    await this.supabase.auth.signOut();
  }
}
