import type {
  AcceptedResponseDto,
  ConfirmEmailDto,
  ForgotPasswordDto,
  ResendConfirmEmailDto,
  ResetPasswordDto,
} from "../entities";

/**
 * Auth side-channel endpoints (password reset, email confirmation) not covered
 * by the session-focused {@link AuthClient}. Implemented per backend:
 * {@link RestAuthApiClient} for REST APIs and {@link SupabaseAuthApiClient}
 * for Supabase Auth.
 */
export interface IAuthApiClient {
  forgotPassword(data: ForgotPasswordDto): Promise<AcceptedResponseDto | void>;
  resetPassword(data: ResetPasswordDto): Promise<void>;
  resendConfirmEmail(
    data: ResendConfirmEmailDto,
  ): Promise<AcceptedResponseDto | void>;
  confirmEmail(data: ConfirmEmailDto): Promise<void>;
}
