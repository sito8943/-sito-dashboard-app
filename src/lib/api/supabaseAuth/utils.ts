const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const resolveUsernameFromMetadata = (
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

export const resolveNumericId = (
  rawId: string | undefined,
  defaultId: number,
): number => {
  if (!rawId) return defaultId;
  const parsed = Number(rawId);
  if (Number.isFinite(parsed)) return parsed;
  return defaultId;
};
