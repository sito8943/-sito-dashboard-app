import { DEFAULT_REST_AUTH_API_CLIENT_ENDPOINTS } from "./constants";
import type {
  ResolvedRestAuthApiClientEndpoints,
  RestAuthApiClientOptions,
} from "./types";

export const hasHttpStatus = (error: unknown, status: number): boolean => {
  if (typeof error !== "object" || error === null) return false;
  if (!("status" in error)) return false;
  return (error as { status?: unknown }).status === status;
};

export const resolveRestAuthApiClientEndpoints = (
  options?: RestAuthApiClientOptions,
): ResolvedRestAuthApiClientEndpoints => ({
  ...DEFAULT_REST_AUTH_API_CLIENT_ENDPOINTS,
  ...options?.endpoints,
});
