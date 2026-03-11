import { describe, expect, it } from "vitest";

import { parseQueries } from "./query";

import type { BaseEntityDto, BaseFilterDto } from "lib";

type UserDto = BaseEntityDto & { name: string };
type UserFilterDto = BaseFilterDto & { status?: string };

describe("parseQueries", () => {
  it("does not serialize undefined query fields", () => {
    const result = parseQueries<UserDto, UserFilterDto>(
      "/users",
      { sortingBy: "name" },
      { status: "active" },
    );

    expect(result).toContain("sort=name");
    expect(result).not.toContain("=undefined");
    expect(result).not.toContain("order=");
    expect(result).not.toContain("page=");
    expect(result).not.toContain("pageSize=");
    expect(result).toContain("filters=status==active");
  });

  it("does not add pagination or sort params when query is missing", () => {
    const result = parseQueries<UserDto, UserFilterDto>("/users", undefined, {
      status: "active",
    });

    expect(result).toBe("/users?filters=status==active");
    expect(result).not.toContain("sort=");
    expect(result).not.toContain("order=");
    expect(result).not.toContain("page=");
    expect(result).not.toContain("pageSize=");
  });
});
