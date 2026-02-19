import { beforeEach, describe, expect, it } from "vitest";

import { fromLocal, removeFromLocal, toLocal } from "./local";

describe("local storage utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and reads primitive values", () => {
    toLocal("name", "Sito");
    toLocal("amount", 42);

    expect(fromLocal("name", "string")).toBe("Sito");
    expect(fromLocal("amount", "number")).toBe(42);
  });

  it("stores objects as JSON and parses them back", () => {
    toLocal("profile", { id: 7, role: "admin" });

    expect(localStorage.getItem("profile")).toBe('{"id":7,"role":"admin"}');
    expect(fromLocal("profile", "object")).toEqual({ id: 7, role: "admin" });
  });

  it("parses boolean values from string and numeric forms", () => {
    localStorage.setItem("enabled", "true");
    expect(fromLocal("enabled", "boolean")).toBe(true);

    localStorage.setItem("enabled", "1");
    expect(fromLocal("enabled", "boolean")).toBe(true);

    localStorage.setItem("enabled", "0");
    expect(fromLocal("enabled", "boolean")).toBe(false);
  });

  it("removes keys", () => {
    toLocal("token", "abc");
    removeFromLocal("token");

    expect(fromLocal("token")).toBeUndefined();
  });
});
