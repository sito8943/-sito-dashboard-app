type LocalStorageTransform = "" | "string" | "object" | "number" | "boolean";
type LocalObjectValidator<T> = (value: unknown) => value is T;

const safeParse = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

/**
 * Fetch data from local storage
 * @param key - key to fetch
 * @param as - transform parameter
 * @returns value of key in local storage
 */
export function fromLocal(key: string): string | undefined;
export function fromLocal(key: string, as: ""): string | undefined;
export function fromLocal(key: string, as: "string"): string | undefined;
export function fromLocal<T = unknown>(
  key: string,
  as: "object",
  validate?: LocalObjectValidator<T>,
): T | undefined;
export function fromLocal(key: string, as: "number"): number | undefined;
export function fromLocal(key: string, as: "boolean"): boolean | undefined;
export function fromLocal<T = unknown>(
  key: string,
  as: LocalStorageTransform = "",
  validate?: LocalObjectValidator<T>,
): string | number | boolean | T | undefined {
  const result = localStorage.getItem(key) ?? undefined;
  if (result === undefined) return undefined;
  if (!as.length || as === "string") return result;

  switch (as) {
    case "object": {
      const parsed = safeParse(result);
      if (typeof parsed !== "object" || parsed === null) return undefined;
      if (validate && !validate(parsed)) return undefined;
      return parsed as T;
    }
    case "number": {
      const parsed = Number(result);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    case "boolean":
      return result === "true" || result === "1";
    default:
      return result;
  }
}

/**
 * Save data to local storage
 * @param key - key to save
 * @param value - value to save
 * @returns nothing
 */
export const toLocal = (key: string, value: unknown) => {
  if (value !== null && typeof value === "object") {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  localStorage.setItem(key, String(value));
};

/**
 * Remove data from local storage
 * @param {string} key - key to remove
 * @returns nothing
 */
export const removeFromLocal = (key: string) => localStorage.removeItem(key);
