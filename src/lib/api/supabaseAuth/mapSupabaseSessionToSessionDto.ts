import type { Session } from "@supabase/supabase-js";

import type { SessionDto } from "lib";

import { DEFAULT_SUPABASE_SESSION_MAPPER_OPTIONS } from "./constants";
import type { SupabaseSessionMapperOptions } from "./types";
import { resolveNumericId, resolveUsernameFromMetadata } from "./utils";

/**
 * Maps a Supabase session object into the library SessionDto shape.
 * @param session - Supabase session payload.
 * @param options - Mapping overrides and metadata key preferences.
 * @returns Normalized SessionDto.
 */
export const mapSupabaseSessionToSessionDto = (
  session: Session,
  options?: SupabaseSessionMapperOptions,
): SessionDto => {
  const resolvedOptions = {
    ...DEFAULT_SUPABASE_SESSION_MAPPER_OPTIONS,
    ...options,
  };

  const resolvedUsername = resolveUsernameFromMetadata(
    session.user.user_metadata,
    resolvedOptions.usernameMetadataKeys,
  );

  return {
    id: resolveNumericId(session.user.id, resolvedOptions.defaultId),
    username: resolvedUsername ?? resolvedOptions.defaultUsername,
    email: session.user.email ?? resolvedOptions.defaultEmail,
    token: session.access_token,
    refreshToken: session.refresh_token ?? null,
    accessTokenExpiresAt:
      typeof session.expires_at === "number"
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
  };
};
