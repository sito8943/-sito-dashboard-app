import type { Session } from "@supabase/supabase-js";

import type { SessionDto } from "lib";

export type SupabaseSessionMapper = (session: Session) => SessionDto;

export type SupabaseSessionMapperOptions = {
  defaultId?: number;
  defaultUsername?: string;
  defaultEmail?: string;
  usernameMetadataKeys?: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const resolveUsernameFromMetadata = (
  metadata: unknown,
  keys: string[],
): string | undefined => {
  if (!isRecord(metadata)) return undefined;

  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim().length > 0)
      return value.trim();
  }

  return undefined;
};

const resolveNumericId = (
  rawId: string | undefined,
  defaultId: number,
): number => {
  if (!rawId) return defaultId;
  const parsed = Number(rawId);
  if (Number.isFinite(parsed)) return parsed;
  return defaultId;
};

export const mapSupabaseSessionToSessionDto: (
  session: Session,
  options?: SupabaseSessionMapperOptions,
) => SessionDto = (session, options) => {
  const {
    defaultId = 0,
    defaultUsername = "",
    defaultEmail = "",
    usernameMetadataKeys = ["username", "name", "full_name"],
  } = options ?? {};

  const resolvedUsername = resolveUsernameFromMetadata(
    session.user.user_metadata,
    usernameMetadataKeys,
  );

  return {
    id: resolveNumericId(session.user.id, defaultId),
    username: resolvedUsername ?? defaultUsername,
    email: session.user.email ?? defaultEmail,
    token: session.access_token,
    refreshToken: session.refresh_token ?? null,
    accessTokenExpiresAt:
      typeof session.expires_at === "number"
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
  };
};
