import { describe, expect, it } from "vitest";
import type { Session } from "@supabase/supabase-js";

import { mapSupabaseSessionToSessionDto } from "./supabaseAuth";

const createSession = (overrides?: Partial<Session>): Session => {
  return {
    access_token: "access-token",
    refresh_token: "refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: 1893456000,
    user: {
      id: "42",
      email: "user@mail.com",
      user_metadata: {
        username: "sito",
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: "2024-01-01T00:00:00.000Z",
    },
    ...overrides,
  } as unknown as Session;
};

describe("mapSupabaseSessionToSessionDto", () => {
  it("maps access/refresh/expiry and metadata username", () => {
    const dto = mapSupabaseSessionToSessionDto(createSession());

    expect(dto.id).toBe(42);
    expect(dto.username).toBe("sito");
    expect(dto.email).toBe("user@mail.com");
    expect(dto.token).toBe("access-token");
    expect(dto.refreshToken).toBe("refresh-token");
    expect(dto.accessTokenExpiresAt).toBe("2030-01-01T00:00:00.000Z");
  });

  it("uses defaults when user id is non-numeric and metadata is missing", () => {
    const dto = mapSupabaseSessionToSessionDto(
      createSession({
        user: {
          id: "uuid-like",
          email: undefined,
          user_metadata: {},
          app_metadata: {},
          aud: "authenticated",
          created_at: "2024-01-01T00:00:00.000Z",
        } as unknown as Session["user"],
      }),
      {
        defaultId: 7,
        defaultUsername: "fallback-user",
        defaultEmail: "fallback@mail.com",
      },
    );

    expect(dto.id).toBe(7);
    expect(dto.username).toBe("fallback-user");
    expect(dto.email).toBe("fallback@mail.com");
  });
});
