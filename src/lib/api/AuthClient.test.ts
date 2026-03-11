import { describe, expect, it, vi } from "vitest";

import { AuthClient } from "./AuthClient";
import { Methods } from "./utils/services";
import type { SessionDto } from "../entities";

const session: SessionDto = {
  id: 1,
  username: "sito",
  email: "sito@mail.com",
  token: "jwt-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2030-01-01T00:00:00.000Z",
};

describe("AuthClient", () => {
  it("login forwards rememberMe in sign-in payload", async () => {
    const client = new AuthClient("https://api.test/");
    const doQuerySpy = vi
      .spyOn(client.api, "doQuery")
      .mockResolvedValue(session);

    const result = await client.login({
      email: "sito@mail.com",
      password: "123456",
      rememberMe: true,
    });

    expect(result).toEqual(session);
    expect(doQuerySpy).toHaveBeenCalledWith("auth/sign-in", Methods.POST, {
      email: "sito@mail.com",
      password: "123456",
      rememberMe: true,
    });
  });

  it("refresh calls auth/refresh endpoint", async () => {
    const client = new AuthClient("https://api.test/");
    const doQuerySpy = vi
      .spyOn(client.api, "doQuery")
      .mockResolvedValue(session);

    const result = await client.refresh({
      refreshToken: "refresh-token",
    });

    expect(result).toEqual(session);
    expect(doQuerySpy).toHaveBeenCalledWith("auth/refresh", Methods.POST, {
      refreshToken: "refresh-token",
    });
  });

  it("logout sends authorization and optional refresh token", async () => {
    const client = new AuthClient("https://api.test/");
    const doQuerySpy = vi
      .spyOn(client.api, "doQuery")
      .mockResolvedValue(undefined);

    await client.logout({
      accessToken: "jwt-token",
      refreshToken: "refresh-token",
    });

    expect(doQuerySpy).toHaveBeenCalledWith(
      "auth/sign-out",
      Methods.POST,
      {
        refreshToken: "refresh-token",
      },
      {
        Authorization: "Bearer jwt-token",
      },
    );
  });

  it("getSession uses default token acquirer header", async () => {
    const client = new AuthClient("https://api.test/");
    const defaultTokenAcquirerSpy = vi
      .spyOn(client.api, "defaultTokenAcquirer")
      .mockReturnValue({
        Authorization: "Bearer jwt-token",
      });
    const doQuerySpy = vi
      .spyOn(client.api, "doQuery")
      .mockResolvedValue(session);

    const result = await client.getSession();

    expect(result).toEqual(session);
    expect(defaultTokenAcquirerSpy).toHaveBeenCalledOnce();
    expect(doQuerySpy).toHaveBeenCalledWith(
      "auth/session",
      Methods.GET,
      undefined,
      {
        Authorization: "Bearer jwt-token",
      },
    );
  });
});
