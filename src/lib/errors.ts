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

export function isValidationError(error: unknown): error is ValidationError {
  if (!error || typeof error !== "object") return false;
  const maybe = error as Partial<ValidationError> & { errors?: unknown };
  return (
    Array.isArray(maybe.errors) &&
    maybe.errors.every(
      (e) => Array.isArray(e) && e.length === 2 && typeof e[0] === "string"
    )
  );
}

export function isHttpError(error: unknown): error is HttpError {
  if (!error || typeof error !== "object") return false;
  const maybe = error as Partial<HttpError>;
  return (
    typeof maybe?.status === "number" && typeof maybe?.message === "string"
  );
}

export function mapValidationErrors(
  error: ValidationError,
  map: (field: string, code: string) => string
): string[] {
  if (!error?.errors) return [];
  return error.errors.map(([field, code]) => map(field, code));
}
