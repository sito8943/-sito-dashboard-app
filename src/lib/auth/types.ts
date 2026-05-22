export const AuthRouteQueryParam = {
  error: "error",
  errorDescription: "error_description",
  accessToken: "access_token",
  accessTokenLegacy: "accessToken",
  refreshToken: "refresh_token",
  token: "token",
  tokenHash: "token_hash",
  type: "type",
} as const;

export type AuthRouteQueryParamKey =
  (typeof AuthRouteQueryParam)[keyof typeof AuthRouteQueryParam];

export const AuthRouteQueryParamType = {
  email: "email",
  recovery: "recovery",
  signUp: "signup",
} as const;

export type AuthRouteQueryParamTypeKey =
  (typeof AuthRouteQueryParamType)[keyof typeof AuthRouteQueryParamType];
