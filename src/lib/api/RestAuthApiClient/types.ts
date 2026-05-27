export type RestAuthRecoveryClientEndpoints = {
  forgotPassword?: string;
  resetPassword?: string;
  resendConfirmEmail?: string;
  confirmEmail?: string;
  /**
   * Optional fallback for legacy backends that still expose
   * `/confirm/verify` while `/confirm` is migrating. Used only on 404.
   */
  confirmEmailFallback?: string;
};

export type RestAuthRecoveryClientOptions = {
  endpoints?: RestAuthRecoveryClientEndpoints;
};

export type ResolvedRestAuthRecoveryClientEndpoints = Required<
  Omit<RestAuthRecoveryClientEndpoints, "confirmEmailFallback">
> & {
  confirmEmailFallback?: string;
};

export type RestAuthApiClientEndpoints = RestAuthRecoveryClientEndpoints;
export type RestAuthApiClientOptions = RestAuthRecoveryClientOptions;
export type ResolvedRestAuthApiClientEndpoints =
  ResolvedRestAuthRecoveryClientEndpoints;
