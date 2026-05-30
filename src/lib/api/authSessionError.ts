type AuthSessionErrorShape = {
  status: number;
  message: string;
  code?: string;
};

const DEFINITIVE_STATUS_CODES = new Set([401, 403]);
const RETRYABLE_STATUS_CODES = new Set([0, 408, 425, 429, 500, 502, 503, 504]);

const DEFINITIVE_MESSAGE_PATTERNS = [
  /invalid[_\s-]?grant/i,
  /invalid refresh token/i,
  /refresh token.*expired/i,
  /refresh token.*revoked/i,
  /revoked refresh token/i,
  /session expired/i,
  /session not found/i,
  /no active session/i,
  /token has expired/i,
  /jwt expired/i,
  /authentication session missing/i,
];

const RETRYABLE_MESSAGE_PATTERNS = [
  /network/i,
  /failed to fetch/i,
  /fetch failed/i,
  /load failed/i,
  /timeout/i,
  /timed out/i,
  /offline/i,
  /temporarily unavailable/i,
  /invalid json response/i,
  /invalid response payload/i,
  /econnreset/i,
  /enotfound/i,
  /eai_again/i,
  /cors/i,
];

const readString = (value: unknown, key: string) => {
  if (typeof value !== "object" || value === null) return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" && field.length ? field : undefined;
};

const readNumber = (value: unknown, key: string) => {
  if (typeof value !== "object" || value === null) return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "number" ? field : undefined;
};

export const normalizeAuthSessionError = (
  value: unknown,
  fallback: Partial<AuthSessionErrorShape> = {},
): AuthSessionErrorShape => {
  const status = readNumber(value, "status") ?? fallback.status ?? 500;
  const message =
    readString(value, "message") ??
    readString(value, "error_description") ??
    readString(value, "error") ??
    fallback.message ??
    "Authentication request failed";
  const code = readString(value, "code") ?? fallback.code;

  return { status, message, code };
};

export const isDefinitiveAuthSessionError = (value: unknown) => {
  const error = normalizeAuthSessionError(value);
  const haystack = `${error.code ?? ""} ${error.message}`.trim();

  if (DEFINITIVE_STATUS_CODES.has(error.status)) return true;
  if (error.status === 400)
    return DEFINITIVE_MESSAGE_PATTERNS.some((pattern) =>
      pattern.test(haystack),
    );

  return DEFINITIVE_MESSAGE_PATTERNS.some((pattern) => pattern.test(haystack));
};

export const isRetryableAuthSessionError = (value: unknown) => {
  if (isDefinitiveAuthSessionError(value)) return false;

  const error = normalizeAuthSessionError(value);
  const haystack = `${error.code ?? ""} ${error.message}`.trim();

  if (RETRYABLE_STATUS_CODES.has(error.status)) return true;

  return RETRYABLE_MESSAGE_PATTERNS.some((pattern) => pattern.test(haystack));
};
