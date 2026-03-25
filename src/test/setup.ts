import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const clearIndexedDB = async () => {
  if (typeof indexedDB === "undefined") return;

  const indexedDbWithDatabases = indexedDB as IDBFactory & {
    databases?: () => Promise<Array<{ name?: string }>>;
  };

  if (!indexedDbWithDatabases.databases) return;

  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });

  let databases: Array<{ name?: string }> = [];
  try {
    databases = await withTimeout(indexedDbWithDatabases.databases(), 100);
  } catch {
    return;
  }

  await Promise.all(
    (databases ?? []).map(
      (db) =>
        new Promise<void>((resolve) => {
          if (!db?.name) {
            resolve();
            return;
          }

          const request = indexedDB.deleteDatabase(db.name);
          const timer = setTimeout(() => resolve(), 100);
          request.onsuccess = () => {
            clearTimeout(timer);
            resolve();
          };
          request.onerror = () => {
            clearTimeout(timer);
            resolve();
          };
          request.onblocked = () => {
            clearTimeout(timer);
            resolve();
          };
        }),
    ),
  );
};

beforeEach(async () => {
  vi.clearAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
  await clearIndexedDB();
});

afterEach(async () => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
  await clearIndexedDB();
});
