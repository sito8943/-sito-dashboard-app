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
      { status: "active", softDeleteScope: "DELETED" },
    );

    expect(result).toContain("sort=name");
    expect(result).not.toContain("=undefined");
    expect(result).not.toContain("order=");
    expect(result).not.toContain("page=");
    expect(result).not.toContain("pageSize=");
    expect(result).toContain("softDeleteScope=DELETED");
    expect(result).toContain("filters=status==active");
  });

  it("does not add pagination or sort params when query is missing", () => {
    const result = parseQueries<UserDto, UserFilterDto>("/users", undefined, {
      softDeleteScope: "ACTIVE",
    });

    expect(result).toBe("/users?softDeleteScope=ACTIVE");
    expect(result).not.toContain("sort=");
    expect(result).not.toContain("order=");
    expect(result).not.toContain("page=");
    expect(result).not.toContain("pageSize=");
  });

  it("serializes date filters as ISO strings", () => {
    const deletedAt = new Date("2026-01-01T10:00:00.000Z");

    const result = parseQueries<UserDto, UserFilterDto>("/users", undefined, {
      deletedAt,
    });

    expect(result).toContain(
      `filters=deletedAt==${encodeURIComponent(deletedAt.toISOString())}`,
    );
  });
});
