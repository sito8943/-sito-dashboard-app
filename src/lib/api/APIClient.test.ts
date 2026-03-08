import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { APIClient } from "./APIClient";
import { makeRequest, Methods } from "./utils/services";
import type { BaseEntityDto, BaseFilterDto } from "lib";
import type { HttpResponse } from "./utils/types";

vi.mock("./utils/services", async () => {
  const actual = await vi.importActual<typeof import("./utils/services")>(
    "./utils/services"
  );

  return {
    ...actual,
    makeRequest: vi.fn(),
  };
});

describe("APIClient", () => {
  const makeRequestMock = vi.mocked(makeRequest);

  type UserDto = BaseEntityDto & { name: string };
  type UserFilterDto = BaseFilterDto & { status?: string };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    makeRequestMock.mockReset();
    APIClient.refreshInFlight.clear();
  });

  it("creates auth header from local storage token", () => {
    localStorage.setItem("user", "token-123");
    const client = new APIClient("https://api.test");

    expect(client.defaultTokenAcquirer()).toEqual({
      Authorization: "Bearer token-123",
    });
  });

  it("returns cookie credentials header when requested", () => {
    const client = new APIClient("https://api.test");

    expect(client.defaultTokenAcquirer(true)).toEqual({
      credentials: "include",
    });
  });

  it("merges secured header and custom header in doQuery", async () => {
    localStorage.setItem("user", "token-abc");
    makeRequestMock.mockResolvedValue({
      data: { ok: true },
      status: 200,
      error: null,
    });

    const client = new APIClient("https://api.test");
    const result = await client.doQuery<{ ok: boolean }, { active: boolean }>(
      "/users",
      Methods.POST,
      { active: true },
      { "X-App": "dashboard" }
    );

    expect(result).toEqual({ ok: true });
    expect(makeRequestMock).toHaveBeenCalledWith(
      "https://api.test/users",
      Methods.POST,
      { active: true },
      {
        Authorization: "Bearer token-abc",
        "X-App": "dashboard",
      }
    );
  });

  it("uses custom tokenAcquirer when provided", async () => {
    const customTokenAcquirer = vi.fn(() => ({
      Authorization: "Bearer custom-token",
    }));
    makeRequestMock.mockResolvedValue({
      data: { ok: true },
      status: 200,
      error: null,
    });

    const client = new APIClient(
      "https://api.test",
      "user",
      true,
      customTokenAcquirer
    );

    await client.doQuery("/users");

    expect(customTokenAcquirer).toHaveBeenCalledOnce();
    expect(makeRequestMock).toHaveBeenCalledWith(
      "https://api.test/users",
      Methods.GET,
      undefined,
      { Authorization: "Bearer custom-token" }
    );
  });

  it("throws on doQuery when request returns error", async () => {
    makeRequestMock.mockResolvedValue({
      data: null,
      status: 500,
      error: { status: 500, message: "Boom" },
    });

    const client = new APIClient("https://api.test");

    await expect(client.doQuery("/users")).rejects.toEqual({
      status: 500,
      message: "Boom",
    });
  });

  it("refreshes access token before secured request when expired", async () => {
    localStorage.setItem("user", "expired-access-token");
    localStorage.setItem("refreshToken", "refresh-token-1");
    localStorage.setItem("accessTokenExpiresAt", "2000-01-01T00:00:00.000Z");
    localStorage.setItem("remember", "true");

    makeRequestMock
      .mockResolvedValueOnce({
        data: {
          id: 1,
          username: "sito",
          email: "sito@mail.com",
          token: "new-access-token",
          refreshToken: "refresh-token-2",
          accessTokenExpiresAt: "2035-01-01T00:00:00.000Z",
        },
        status: 200,
        error: null,
      })
      .mockResolvedValueOnce({
        data: { ok: true },
        status: 200,
        error: null,
      });

    const client = new APIClient("https://api.test");
    const result = await client.doQuery<{ ok: boolean }>("/users");

    expect(result).toEqual({ ok: true });
    expect(makeRequestMock).toHaveBeenNthCalledWith(
      1,
      "https://api.test/auth/refresh",
      Methods.POST,
      { refreshToken: "refresh-token-1" }
    );
    expect(makeRequestMock).toHaveBeenNthCalledWith(
      2,
      "https://api.test/users",
      Methods.GET,
      undefined,
      { Authorization: "Bearer new-access-token" }
    );
    expect(localStorage.getItem("user")).toBe("new-access-token");
    expect(localStorage.getItem("refreshToken")).toBe("refresh-token-2");
    expect(localStorage.getItem("accessTokenExpiresAt")).toBe(
      "2035-01-01T00:00:00.000Z"
    );
  });

  it("retries once after 401 by refreshing token", async () => {
    localStorage.setItem("user", "stale-access-token");
    localStorage.setItem("refreshToken", "refresh-token-1");
    localStorage.setItem("accessTokenExpiresAt", "2035-01-01T00:00:00.000Z");

    makeRequestMock
      .mockResolvedValueOnce({
        data: null,
        status: 401,
        error: { status: 401, message: "Unauthorized" },
      })
      .mockResolvedValueOnce({
        data: {
          id: 1,
          username: "sito",
          email: "sito@mail.com",
          token: "fresh-access-token",
          refreshToken: "refresh-token-2",
          accessTokenExpiresAt: "2036-01-01T00:00:00.000Z",
        },
        status: 200,
        error: null,
      })
      .mockResolvedValueOnce({
        data: { ok: true },
        status: 200,
        error: null,
      });

    const client = new APIClient("https://api.test");
    const result = await client.doQuery<{ ok: boolean }>("/users");

    expect(result).toEqual({ ok: true });
    expect(makeRequestMock).toHaveBeenNthCalledWith(
      1,
      "https://api.test/users",
      Methods.GET,
      undefined,
      { Authorization: "Bearer stale-access-token" }
    );
    expect(makeRequestMock).toHaveBeenNthCalledWith(
      2,
      "https://api.test/auth/refresh",
      Methods.POST,
      { refreshToken: "refresh-token-1" }
    );
    expect(makeRequestMock).toHaveBeenNthCalledWith(
      3,
      "https://api.test/users",
      Methods.GET,
      undefined,
      { Authorization: "Bearer fresh-access-token" }
    );
  });

  it("uses a single refresh request for concurrent calls", async () => {
    localStorage.setItem("user", "expired-access-token");
    localStorage.setItem("refreshToken", "refresh-token-1");
    localStorage.setItem("accessTokenExpiresAt", "2000-01-01T00:00:00.000Z");

    let releaseRefresh!: (value: HttpResponse) => void;
    const refreshPromise = new Promise<HttpResponse>((resolve) => {
      releaseRefresh = resolve;
    });

    makeRequestMock.mockImplementation(async (url) => {
      if (url.includes("auth/refresh"))
        return await refreshPromise;
      return {
        data: { ok: true },
        status: 200,
        error: null,
      };
    });

    const client = new APIClient("https://api.test");
    const first = client.doQuery<{ ok: boolean }>("/users");
    const second = client.doQuery<{ ok: boolean }>("/projects");

    await Promise.resolve();
    const refreshCallsWhilePending = makeRequestMock.mock.calls.filter(
      ([url]) => url.includes("auth/refresh")
    );
    expect(refreshCallsWhilePending).toHaveLength(1);

    releaseRefresh({
      data: {
        id: 1,
        username: "sito",
        email: "sito@mail.com",
        token: "fresh-access-token",
        refreshToken: "refresh-token-2",
        accessTokenExpiresAt: "2035-01-01T00:00:00.000Z",
      },
      status: 200,
      error: null,
    });

    const [firstResult, secondResult] = await Promise.all([first, second]);
    expect(firstResult).toEqual({ ok: true });
    expect(secondResult).toEqual({ ok: true });

    const refreshCalls = makeRequestMock.mock.calls.filter(
      ([url]) => url.includes("auth/refresh")
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it("clears local session when refresh fails", async () => {
    localStorage.setItem("user", "expired-access-token");
    localStorage.setItem("refreshToken", "refresh-token-1");
    localStorage.setItem("accessTokenExpiresAt", "2000-01-01T00:00:00.000Z");
    localStorage.setItem("remember", "true");

    makeRequestMock.mockResolvedValue({
      data: null,
      status: 401,
      error: { status: 401, message: "Invalid refresh token" },
    });

    const client = new APIClient("https://api.test");

    await expect(client.doQuery("/users")).rejects.toEqual({
      status: 401,
      message: "Invalid refresh token",
    });
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("refreshToken")).toBeNull();
    expect(localStorage.getItem("accessTokenExpiresAt")).toBeNull();
    expect(localStorage.getItem("remember")).toBeNull();
  });

  it("builds query URL in get and returns query result", async () => {
    localStorage.setItem("user", "token-xyz");
    makeRequestMock.mockResolvedValue({
      data: {
        sort: "id",
        order: "asc",
        currentPage: 1,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        items: [
          {
            id: 1,
            name: "Sito",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      status: 200,
      error: null,
    });

    const client = new APIClient("https://api.test");
    const result = await client.get<UserDto, UserFilterDto>(
      "/users",
      {
        sortingBy: "id",
        sortingOrder: "ASC" as any,
        currentPage: 1,
        pageSize: 10,
      },
      { status: "active" }
    );

    const [url, method] = makeRequestMock.mock.calls[0] as [
      string,
      Methods,
    ];
    expect(url).toContain("/users?");
    expect(url).toContain("sort=id");
    expect(url).toContain("order=ASC");
    expect(url).toContain("page=1");
    expect(url).toContain("pageSize=10");
    expect(url).toContain("filters=status==active");
    expect(method).toBe(Methods.GET);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(1);
  });

  it("throws post fallback error when response data is missing", async () => {
    makeRequestMock.mockResolvedValue({
      data: null,
      status: 200,
      error: null,
    });

    const client = new APIClient("https://api.test");

    await expect(client.post("/users", { name: "Sito" })).rejects.toEqual({
      status: 200,
      message: "Unknown error",
    });
  });
});
