import { afterEach, describe, expect, it, vi } from "vitest";

import { buildQueryUrl, makeRequest, Methods } from "./services";

describe("makeRequest", () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch");

  afterEach(() => {
    fetchSpy.mockReset();
  });

  it("returns parsed data for successful JSON responses", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ id: 7, name: "Sito" }), { status: 200 })
    );

    const result = await makeRequest<undefined, { id: number; name: string }>(
      "https://api.test/users"
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/users",
      expect.objectContaining({
        method: Methods.GET,
      })
    );
    expect(result).toEqual({
      data: { id: 7, name: "Sito" },
      status: 200,
      error: null,
    });
  });

  it("returns null data for 204 responses", async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 204 }));

    const result = await makeRequest("https://api.test/users");

    expect(result).toEqual({
      data: null,
      status: 204,
      error: null,
    });
  });

  it("includes body and content-type when body is provided", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await makeRequest("https://api.test/users", Methods.POST, { name: "Sito" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.test/users",
      expect.objectContaining({
        method: Methods.POST,
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ name: "Sito" }),
      })
    );
  });

  it("maps HTTP errors using JSON message payload", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid payload" }), {
        status: 400,
        statusText: "Bad Request",
      })
    );

    const result = await makeRequest("https://api.test/users", Methods.POST, {
      name: "",
    });

    expect(result).toEqual({
      data: null,
      status: 400,
      error: { status: 400, message: "Invalid payload" },
    });
  });

  it("maps network errors to status 500", async () => {
    fetchSpy.mockRejectedValue(new Error("Network down"));

    const result = await makeRequest("https://api.test/users");

    expect(result).toEqual({
      data: null,
      status: 500,
      error: { status: 500, message: "Network down" },
    });
  });
});

describe("buildQueryUrl", () => {
  it("builds and encodes query params while skipping nullish values", () => {
    const result = buildQueryUrl("/users", {
      q: "John Doe",
      page: 2,
      nullable: null,
      optional: undefined,
    });

    expect(result).toBe("/users?q=John%20Doe&page=2");
  });
});
