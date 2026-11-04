/**
 * Reads the `exp` claim of a JWT without verifying it.
 * The access token's own expiry is absolute (epoch seconds), unlike an
 * `accessTokenExpiresAt` sent as a date without offset, which the browser
 * would read in its local time zone.
 * @param token - access token
 * @returns expiry in epoch milliseconds, or undefined when unreadable
 */
export const getJwtExpiry = (token: string): number | undefined => {
  const payload = token.split(".")[1];
  if (!payload) return undefined;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const claims: unknown = JSON.parse(atob(padded));
    if (typeof claims !== "object" || claims === null) return undefined;
    const exp = (claims as Record<string, unknown>).exp;
    return typeof exp === "number" && Number.isFinite(exp)
      ? exp * 1000
      : undefined;
  } catch {
    return undefined;
  }
};
