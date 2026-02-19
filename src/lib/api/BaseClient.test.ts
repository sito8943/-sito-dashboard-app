import { describe, expect, it, vi } from "vitest";

import { BaseClient } from "./BaseClient";
import { Methods } from "./utils/services";

import type {
  BaseCommonEntityDto,
  BaseEntityDto,
  BaseFilterDto,
  DeleteDto,
  ImportDto,
  ImportPreviewDto,
} from "lib";

type UserDto = BaseEntityDto & {
  name: string;
};

type UserCommonDto = BaseCommonEntityDto & {
  name: string;
};

type UserAddDto = {
  name: string;
};

type UserUpdateDto = DeleteDto & {
  name: string;
};

type UserFilterDto = BaseFilterDto & {
  status?: string;
};

type UserImportPreviewDto = ImportPreviewDto & {
  row: number;
};

const createClient = () =>
  new BaseClient<
    "users",
    UserDto,
    UserCommonDto,
    UserAddDto,
    UserUpdateDto,
    UserFilterDto,
    UserImportPreviewDto
  >("users", "https://api.test");

describe("BaseClient", () => {
  it("delegates insert to api.post", async () => {
    const client = createClient();
    const postSpy = vi.spyOn(client.api, "post").mockResolvedValue({
      id: 1,
      name: "Sito",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserDto);

    await client.insert({ name: "Sito" });

    expect(postSpy).toHaveBeenCalledWith("users", { name: "Sito" });
  });

  it("delegates update to api.patch using entity id", async () => {
    const client = createClient();
    const patchSpy = vi.spyOn(client.api, "patch").mockResolvedValue({
      id: 7,
      name: "Updated",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserDto);

    await client.update({ id: 7, name: "Updated" });

    expect(patchSpy).toHaveBeenCalledWith("users/7", { id: 7, name: "Updated" });
  });

  it("delegates get to api.get with query and filters", async () => {
    const client = createClient();
    const getSpy = vi.spyOn(client.api, "get").mockResolvedValue({
      sort: "id",
      order: "asc",
      currentPage: 1,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      items: [],
    });

    await client.get(
      {
        sortingBy: "id",
        sortingOrder: "ASC" as any,
        currentPage: 1,
        pageSize: 10,
      },
      { status: "active" }
    );

    expect(getSpy).toHaveBeenCalledWith(
      "users",
      {
        sortingBy: "id",
        sortingOrder: "ASC" as any,
        currentPage: 1,
        pageSize: 10,
      },
      { status: "active" }
    );
  });

  it("builds export URL and delegates to api.doQuery", async () => {
    const client = createClient();
    const doQuerySpy = vi
      .spyOn(client.api, "doQuery")
      .mockResolvedValue([] as UserDto[]);

    await client.export({ status: "active" });

    const [url, method, body] = doQuerySpy.mock.calls[0] as [
      string,
      Methods,
      undefined,
    ];
    expect(url).toContain("users/export");
    expect(url).toContain("filters=status==active");
    expect(method).toBe(Methods.GET);
    expect(body).toBeUndefined();
  });

  it("delegates import to api.doQuery with POST", async () => {
    const client = createClient();
    const doQuerySpy = vi.spyOn(client.api, "doQuery").mockResolvedValue(2);
    const payload: ImportDto<UserImportPreviewDto> = {
      override: false,
      items: [{ row: 1, existing: false }],
    };

    await client.import(payload);

    expect(doQuerySpy).toHaveBeenCalledWith(
      "users/import",
      Methods.POST,
      payload
    );
  });

  it("delegates softDelete and restore to API methods", async () => {
    const client = createClient();
    const deleteSpy = vi.spyOn(client.api, "delete").mockResolvedValue(2);
    const patchSpy = vi.spyOn(client.api, "patch").mockResolvedValue(2);

    await client.softDelete([1, 2]);
    await client.restore([3, 4]);

    expect(deleteSpy).toHaveBeenCalledWith("users", [1, 2]);
    expect(patchSpy).toHaveBeenCalledWith("users/restore", [3, 4]);
  });
});
