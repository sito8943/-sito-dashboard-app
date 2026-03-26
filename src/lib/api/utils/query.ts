// types
import { QueryParam } from "../types";

// entities
import { BaseFilterDto } from "../../entities";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const toEncodedScalar = (value: unknown): string => {
  if (value instanceof Date) return encodeURIComponent(value.toISOString());
  return encodeURIComponent(String(value));
};

const resolveSoftDeleteScope = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (
    normalized === "ACTIVE" ||
    normalized === "DELETED" ||
    normalized === "ALL"
  )
    return normalized;
  return undefined;
};

/**
 * Builds a query string from pagination and filter params
 * @param query - Pagination and sorting info
 * @param filters - Filters to apply
 * @returns - Encoded query string
 */
export const parseQueries = <TDto, TFilter extends BaseFilterDto>(
  endpoint: string,
  query?: QueryParam<TDto>,
  filters?: TFilter,
) => {
  const queryParts: string[] = [];

  // Build pagination and sorting params
  if (query) {
    const { sortingBy, sortingOrder, currentPage, pageSize } = query;
    if (sortingBy !== undefined) queryParts.push(`sort=${String(sortingBy)}`);
    if (sortingOrder !== undefined) queryParts.push(`order=${sortingOrder}`);
    if (currentPage !== undefined) queryParts.push(`page=${currentPage}`);
    if (pageSize !== undefined) queryParts.push(`pageSize=${pageSize}`);
  }

  // Build filters
  if (filters) {
    const softDeleteScope = resolveSoftDeleteScope(filters.softDeleteScope);
    if (softDeleteScope)
      queryParts.push(`softDeleteScope=${encodeURIComponent(softDeleteScope)}`);

    const filterParts = Object.entries(filters)
      .filter(
        ([key, value]) =>
          key !== "softDeleteScope" &&
          value !== null &&
          value !== undefined &&
          value !== "",
      )
      .flatMap(([key, value]) => {
        // Multiple values (array)
        if (Array.isArray(value)) {
          return value.map((v) => {
            if (v instanceof Date) return `${key}==${toEncodedScalar(v)}`;
            if (isRecord(v)) return `${key}==${toEncodedScalar(v.id ?? "")}`;
            return `${key}==${toEncodedScalar(v)}`;
          });
        }

        // Range filters (start/end)
        if (isRecord(value) && "start" in value && "end" in value) {
          const range: string[] = [];
          if (value.start != null && value.start !== "")
            range.push(`${key}>=${toEncodedScalar(value.start)}`);
          if (value.end != null && value.end !== "")
            range.push(`${key}<=${toEncodedScalar(value.end)}`);
          return range;
        }

        // Object with `id` fallback
        if (value instanceof Date) return `${key}==${toEncodedScalar(value)}`;
        if (isRecord(value)) {
          return `${key}==${toEncodedScalar(value.id ?? "")}`;
        }

        // Primitive
        return `${key}==${toEncodedScalar(value)}`;
      });

    if (filterParts.length > 0) {
      queryParts.push(`filters=${filterParts.join(",")}`);
    }
  }

  return queryParts.length ? `${endpoint}?${queryParts.join("&")}` : endpoint;
};
