export type ServiceError = {
  key: string;
  message: string;
};

export type FieldErrorTuple = [key: string, code: string];

export interface ValidationError extends Error {
  // Pair of field name and error code/message key
  errors: FieldErrorTuple[];
}

export interface HttpError extends Error {
  status: number;
  message: string;
}

/**
 * Type guard for validation errors with field/code tuples.
 * @param error - Unknown error candidate.
 * @returns True when error matches ValidationError shape.
 */
export function isValidationError(error: unknown): error is ValidationError {
  if (!error || typeof error !== "object") return false;
  const maybe = error as Partial<ValidationError> & { errors?: unknown };
  return (
    Array.isArray(maybe.errors) &&
    maybe.errors.every(
      (e) => Array.isArray(e) && e.length === 2 && typeof e[0] === "string",
    )
  );
}

/**
 * Type guard for normalized HTTP-like errors.
 * @param error - Unknown error candidate.
 * @returns True when error matches HttpError shape.
 */
export function isHttpError(error: unknown): error is HttpError {
  if (!error || typeof error !== "object") return false;
  const maybe = error as Partial<HttpError>;
  return (
    typeof maybe?.status === "number" && typeof maybe?.message === "string"
  );
}

/**
 * Maps validation tuples to translated or domain-specific messages.
 * @param error - Validation error instance.
 * @param map - Mapper from field/code to display message.
 * @returns List of mapped messages.
 */
export function mapValidationErrors(
  error: ValidationError,
  map: (field: string, code: string) => string,
): string[] {
  if (!error?.errors) return [];
  return error.errors.map(([field, code]) => map(field, code));
}
