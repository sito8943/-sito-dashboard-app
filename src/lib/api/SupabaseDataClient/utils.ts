import type { SoftDeleteScope } from "lib";

import type { RangeFilterValue } from "./types";

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const hasRangeShape = (value: unknown): value is RangeFilterValue => {
  if (!isRecord(value)) return false;
  return "start" in value || "end" in value;
};

export const isDefined = <T>(value: T | undefined): value is T =>
  value !== undefined;

export const normalizeScalarValue = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  return value;
};

export const resolveSoftDeleteScope = (
  value: unknown,
): SoftDeleteScope | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === "ACTIVE") return "ACTIVE";
  if (normalized === "DELETED") return "DELETED";
  if (normalized === "ALL") return "ALL";
  return undefined;
};
