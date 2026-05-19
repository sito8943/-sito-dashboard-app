import { AuthRouteQueryParam } from "./types";

const recoveryAccessTokenParams = [
  AuthRouteQueryParam.accessToken,
  AuthRouteQueryParam.accessTokenLegacy,
  AuthRouteQueryParam.token,
] as const;

const getHashParams = (hash: string): URLSearchParams => {
  const rawHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const hashQuery = rawHash.includes("?")
    ? rawHash.slice(rawHash.indexOf("?") + 1)
    : rawHash;
  return new URLSearchParams(hashQuery);
};

/**
 * Builds an absolute redirect URL for auth callbacks (confirm email, recovery).
 *
 * @param path - Path relative to `base`.
 * @param base - Origin to resolve against. Defaults to `window.location.origin`.
 *   Returns `undefined` in non-browser environments when `base` is omitted.
 */
export const buildAuthRedirectUrl = (
  path: string,
  base?: string,
): string | undefined => {
  const resolved =
    base ??
    (typeof window !== "undefined" ? window.location.origin : undefined);
  if (!resolved) return undefined;
  return new URL(path, resolved).toString();
};

/**
 * Reads a single auth-related query/hash param from a `Location`-like input.
 * Supabase recovery flows put tokens in the URL hash; this checks both.
 */
export const extractAuthQueryParamFromLocation = (
  hash: string,
  search: string,
  key: string,
): string | null => {
  const searchParams = new URLSearchParams(search);
  const hashParams = getHashParams(hash);

  const fromSearch = searchParams.get(key);
  if (fromSearch && fromSearch.length > 0) return fromSearch;

  const fromHash = hashParams.get(key);
  if (fromHash && fromHash.length > 0) return fromHash;

  return null;
};

/**
 * Tries the canonical access-token param names in order
 * (`access_token`, `accessToken`, `token`) from both query and hash.
 */
export const extractRecoveryAccessTokenFromLocation = (
  hash: string,
  search: string,
): string | null => {
  for (const key of recoveryAccessTokenParams) {
    const token = extractAuthQueryParamFromLocation(hash, search, key);
    if (token) return token;
  }
  return null;
};

/**
 * Extracts a `{ accessToken, refreshToken }` pair from a location. Returns
 * `null` if either is missing.
 */
export const extractAuthSessionTokensFromLocation = (
  hash: string,
  search: string,
): { accessToken: string; refreshToken: string } | null => {
  const accessToken = extractRecoveryAccessTokenFromLocation(hash, search);
  const refreshToken = extractAuthQueryParamFromLocation(
    hash,
    search,
    AuthRouteQueryParam.refreshToken,
  );

  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken };
};

/** True if `error` or `error_description` is present in either query or hash. */
export const hasAuthErrorParamsInLocation = (
  hash: string,
  search: string,
): boolean => {
  const searchParams = new URLSearchParams(search);
  const hashParams = getHashParams(hash);

  return (
    searchParams.has(AuthRouteQueryParam.error) ||
    searchParams.has(AuthRouteQueryParam.errorDescription) ||
    hashParams.has(AuthRouteQueryParam.error) ||
    hashParams.has(AuthRouteQueryParam.errorDescription)
  );
};

/** Safely reads `error.message` when present and a string. */
export const getAuthErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === "string") return message;
  }
  return "";
};
