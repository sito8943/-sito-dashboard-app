const AUTHORIZATION_HEADER = "authorization";
const BEARER_SCHEME = /^bearer\s/i;

const isAuthorizationKey = (key: string) =>
  key.toLowerCase() === AUTHORIZATION_HEADER;

/**
 * Reads the `Authorization` header of a header record, ignoring key case.
 * @param headers - header record
 * @returns the header value, or undefined when absent
 */
export const getAuthorizationHeader = (
  headers: Record<string, string>,
): string | undefined => {
  const key = Object.keys(headers).find(isAuthorizationKey);
  return key === undefined ? undefined : headers[key];
};

/**
 * Drops a caller-supplied `Authorization: Bearer …` header.
 * In `access-token` mode the client sends its current session token: a bearer
 * captured by the caller (e.g. `defaultTokenAcquirer()` passed as request
 * config) goes stale once the session is refreshed. Other schemes are kept.
 * @param headers - caller header record
 * @returns a copy without the bearer `Authorization` header
 */
export const omitBearerAuthorization = (
  headers: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers).filter(
      ([key, value]) => !isAuthorizationKey(key) || !BEARER_SCHEME.test(value),
    ),
  );
