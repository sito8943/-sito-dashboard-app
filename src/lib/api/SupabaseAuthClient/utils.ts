import type { SupabaseRegisterDto } from "./types";

export const trimOrUndefined = (
  value: string | undefined,
): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveSupabaseSignUpMetadata = (
  data: SupabaseRegisterDto,
): Record<string, unknown> => {
  if (data.metadata) return data.metadata;

  const trimmedName = trimOrUndefined(data.name);
  const trimmedUsername = trimOrUndefined(data.username);
  const trimmedEmail = data.email.trim();
  const resolvedName = trimmedName ?? trimmedUsername ?? trimmedEmail;

  return {
    name: resolvedName,
    username: resolvedName,
  };
};
