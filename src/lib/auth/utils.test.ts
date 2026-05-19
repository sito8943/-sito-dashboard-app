import { describe, expect, it } from "vitest";

import {
  buildAuthRedirectUrl,
  extractAuthQueryParamFromLocation,
  extractAuthSessionTokensFromLocation,
  extractRecoveryAccessTokenFromLocation,
  getAuthErrorMessage,
  hasAuthErrorParamsInLocation,
} from "./utils";

describe("buildAuthRedirectUrl", () => {
  it("resolves path against explicit base", () => {
    expect(buildAuthRedirectUrl("/reset", "https://app.test")).toBe(
      "https://app.test/reset",
    );
  });

  it("falls back to window.location.origin in browser", () => {
    expect(buildAuthRedirectUrl("/x")).toBe(`${window.location.origin}/x`);
  });
});

describe("extractAuthQueryParamFromLocation", () => {
  it("reads from query string", () => {
    expect(
      extractAuthQueryParamFromLocation("", "?token_hash=abc", "token_hash"),
    ).toBe("abc");
  });

  it("reads from hash fragment", () => {
    expect(
      extractAuthQueryParamFromLocation("#token_hash=abc", "", "token_hash"),
    ).toBe("abc");
  });

  it("reads from hash with leading ?", () => {
    expect(
      extractAuthQueryParamFromLocation("#?token_hash=abc", "", "token_hash"),
    ).toBe("abc");
  });

  it("returns null when missing", () => {
    expect(extractAuthQueryParamFromLocation("", "", "token_hash")).toBeNull();
  });
});

describe("extractRecoveryAccessTokenFromLocation", () => {
  it("matches access_token first", () => {
    expect(
      extractRecoveryAccessTokenFromLocation(
        "#access_token=a&accessToken=b&token=c",
        "",
      ),
    ).toBe("a");
  });

  it("falls back to accessToken legacy", () => {
    expect(
      extractRecoveryAccessTokenFromLocation("#accessToken=b&token=c", ""),
    ).toBe("b");
  });

  it("falls back to token", () => {
    expect(extractRecoveryAccessTokenFromLocation("#token=c", "")).toBe("c");
  });
});

describe("extractAuthSessionTokensFromLocation", () => {
  it("returns access + refresh pair", () => {
    expect(
      extractAuthSessionTokensFromLocation(
        "#access_token=a&refresh_token=r",
        "",
      ),
    ).toEqual({ accessToken: "a", refreshToken: "r" });
  });

  it("returns null when refresh token missing", () => {
    expect(
      extractAuthSessionTokensFromLocation("#access_token=a", ""),
    ).toBeNull();
  });
});

describe("hasAuthErrorParamsInLocation", () => {
  it("detects error param in search", () => {
    expect(hasAuthErrorParamsInLocation("", "?error=access_denied")).toBe(true);
  });

  it("detects error_description in hash", () => {
    expect(hasAuthErrorParamsInLocation("#error_description=bad", "")).toBe(
      true,
    );
  });

  it("returns false when clean", () => {
    expect(hasAuthErrorParamsInLocation("", "")).toBe(false);
  });
});

describe("getAuthErrorMessage", () => {
  it("reads message from error-shaped object", () => {
    expect(getAuthErrorMessage({ message: "boom" })).toBe("boom");
  });

  it("returns empty string when no message", () => {
    expect(getAuthErrorMessage(null)).toBe("");
    expect(getAuthErrorMessage("plain string")).toBe("");
  });
});
