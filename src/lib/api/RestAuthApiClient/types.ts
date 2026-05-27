export type RestAuthApiClientEndpoints = {
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

export type RestAuthApiClientOptions = {
  endpoints?: RestAuthApiClientEndpoints;
};

export type ResolvedRestAuthApiClientEndpoints = Required<
  Omit<RestAuthApiClientEndpoints, "confirmEmailFallback">
> & {
  confirmEmailFallback?: string;
};
