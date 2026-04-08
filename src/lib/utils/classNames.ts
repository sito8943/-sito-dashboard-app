export type ClassNameValue = string | null | undefined | false;

/**
 * Joins class names safely, trimming each value and skipping empty entries.
 * @param values - Class names that can be conditionally included.
 * @returns Normalized className string.
 */
export const classNames = (...values: ClassNameValue[]) =>
  values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(" ");
