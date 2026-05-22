import { describe, expect, it, vi } from "vitest";

import { APIClient } from "./APIClient";
import { RestAuthApiClient } from "./RestAuthApiClient";
import { Methods } from "./utils/services";

const makeClient = () => {
  const api = new APIClient("https://api.test/", "user", false);
  const client = new RestAuthApiClient(api);
  const spy = vi.spyOn(api, "doQuery").mockResolvedValue(undefined);
  return { client, api, spy };
};

describe("RestAuthApiClient", () => {
  it("forgotPassword posts to default endpoint", async () => {
    const { client, spy } = makeClient();
    spy.mockResolvedValueOnce({ accepted: true, message: "ok" });

    const result = await client.forgotPassword({
      email: "u@mail.com",
      redirectTo: "https://app.test/reset",
    });

    expect(result).toEqual({ accepted: true, message: "ok" });
    expect(spy).toHaveBeenCalledWith("auth/password/forgot", Methods.POST, {
      email: "u@mail.com",
      redirectTo: "https://app.test/reset",
    });
  });

  it("resetPassword forwards access-token payload", async () => {
    const { client, spy } = makeClient();
    await client.resetPassword({
      accessToken: "tok",
      newPassword: "secret",
    });
    expect(spy).toHaveBeenCalledWith("auth/password/reset", Methods.POST, {
      accessToken: "tok",
      newPassword: "secret",
    });
  });

  it("resetPassword forwards token-hash payload", async () => {
    const { client, spy } = makeClient();
    await client.resetPassword({
      tokenHash: "hash",
      type: "recovery",
      newPassword: "secret",
    });
    expect(spy).toHaveBeenCalledWith("auth/password/reset", Methods.POST, {
      tokenHash: "hash",
      type: "recovery",
      newPassword: "secret",
    });
  });

  it("resendConfirmEmail returns AcceptedResponseDto", async () => {
    const { client, spy } = makeClient();
    spy.mockResolvedValueOnce({ accepted: true, message: "sent" });

    const result = await client.resendConfirmEmail({
      email: "u@mail.com",
      redirectTo: "https://app.test/confirm",
    });

    expect(result).toEqual({ accepted: true, message: "sent" });
    expect(spy).toHaveBeenCalledWith(
      "auth/email/confirm/resend",
      Methods.POST,
      { email: "u@mail.com", redirectTo: "https://app.test/confirm" },
    );
  });

  it("confirmEmail uses primary endpoint by default", async () => {
    const { client, spy } = makeClient();
    await client.confirmEmail({ tokenHash: "h", type: "email" });
    expect(spy).toHaveBeenCalledWith("auth/email/confirm", Methods.POST, {
      tokenHash: "h",
      type: "email",
    });
  });

  it("confirmEmail falls back on 404 when configured", async () => {
    const api = new APIClient("https://api.test/", "user", false);
    const client = new RestAuthApiClient(api, {
      endpoints: { confirmEmailFallback: "auth/email/confirm/verify" },
    });
    const spy = vi
      .spyOn(api, "doQuery")
      .mockRejectedValueOnce({ status: 404, message: "Not Found" })
      .mockResolvedValueOnce(undefined);

    await client.confirmEmail({ tokenHash: "h", type: "email" });

    expect(spy).toHaveBeenNthCalledWith(1, "auth/email/confirm", Methods.POST, {
      tokenHash: "h",
      type: "email",
    });
    expect(spy).toHaveBeenNthCalledWith(
      2,
      "auth/email/confirm/verify",
      Methods.POST,
      { tokenHash: "h", type: "email" },
    );
  });

  it("confirmEmail does not fall back on non-404", async () => {
    const api = new APIClient("https://api.test/", "user", false);
    const client = new RestAuthApiClient(api, {
      endpoints: { confirmEmailFallback: "auth/email/confirm/verify" },
    });
    const error = { status: 500, message: "Server" };
    vi.spyOn(api, "doQuery").mockRejectedValueOnce(error);

    await expect(
      client.confirmEmail({ tokenHash: "h", type: "email" }),
    ).rejects.toEqual(error);
  });

  it("respects custom endpoint overrides", async () => {
    const api = new APIClient("https://api.test/", "user", false);
    const client = new RestAuthApiClient(api, {
      endpoints: {
        forgotPassword: "v2/auth/forgot",
        resetPassword: "v2/auth/reset",
        resendConfirmEmail: "v2/auth/resend",
        confirmEmail: "v2/auth/confirm",
      },
    });
    const spy = vi.spyOn(api, "doQuery").mockResolvedValue(undefined);

    await client.forgotPassword({ email: "u@mail.com" });
    await client.resetPassword({
      tokenHash: "h",
      type: "recovery",
      newPassword: "p",
    });
    await client.resendConfirmEmail({ email: "u@mail.com" });
    await client.confirmEmail({ tokenHash: "h", type: "email" });

    expect(spy.mock.calls.map((c) => c[0])).toEqual([
      "v2/auth/forgot",
      "v2/auth/reset",
      "v2/auth/resend",
      "v2/auth/confirm",
    ]);
  });

  it("legacy constructor (baseUrl) builds its own APIClient", async () => {
    const client = new RestAuthApiClient("https://api.test/");
    // @ts-expect-error access private for assertion
    expect(client.api).toBeInstanceOf(APIClient);
  });
});
