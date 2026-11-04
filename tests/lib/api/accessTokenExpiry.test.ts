import { describe, expect, it } from "vitest";

import { getJwtExpiry } from "@/lib/api/accessTokenExpiry";

const encode = (value: object) =>
  btoa(JSON.stringify(value))
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

describe("getJwtExpiry", () => {
  it("reads exp in milliseconds", () => {
    const token = `${encode({ alg: "HS256" })}.${encode({ exp: 1_900_000_000 })}.sig`;
    expect(getJwtExpiry(token)).toBe(1_900_000_000_000);
  });

  it("returns undefined for tokens that are not JWTs or lack exp", () => {
    expect(getJwtExpiry("opaque-token")).toBeUndefined();
    expect(getJwtExpiry("a.not-base64-json.c")).toBeUndefined();
    expect(
      getJwtExpiry(`${encode({ alg: "HS256" })}.${encode({ sub: "1" })}.sig`),
    ).toBeUndefined();
  });
});
