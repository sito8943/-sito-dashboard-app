import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SupabaseDataClient } from "./SupabaseDataClient";

import type {
  BaseCommonEntityDto,
  BaseEntityDto,
  BaseFilterDto,
  DeleteDto,
  ImportPreviewDto,
} from "lib";

type ProductDto = BaseEntityDto & {
  name: string;
  categoryId?: number;
};

type ProductCommonDto = BaseCommonEntityDto & {
  name: string;
};

type ProductAddDto = {
  name: string;
  categoryId?: number;
};

type ProductUpdateDto = DeleteDto & {
  name?: string;
  categoryId?: number;
};

type ProductFilterDto = BaseFilterDto & {
  status?: string[];
  category?: { id: number };
  createdAt?: { start?: string; end?: string };
};

type ProductImportPreviewDto = ImportPreviewDto & {
  id: number;
  name: string;
};

type ProductRow = {
  id: number;
  name: string;
  categoryId?: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type MockError = {
  message: string;
};

type MockArrayResponse<TRow> = {
  data: TRow[] | null;
  error: MockError | null;
  count?: number | null;
  status?: number;
  statusText?: string;
};

type MockSingleResponse<TRow> = {
  data: TRow | null;
  error: MockError | null;
  status?: number;
  statusText?: string;
};

interface MockFilterBuilder<TRow> extends PromiseLike<MockArrayResponse<TRow>> {
  eq: (column: string, value: unknown) => MockFilterBuilder<TRow>;
  in: (column: string, values: unknown[]) => MockFilterBuilder<TRow>;
  gte: (column: string, value: unknown) => MockFilterBuilder<TRow>;
  lte: (column: string, value: unknown) => MockFilterBuilder<TRow>;
  is: (column: string, value: null) => MockFilterBuilder<TRow>;
  not: (
    column: string,
    operator: string,
    value: unknown,
  ) => MockFilterBuilder<TRow>;
  match: (query: Record<string, unknown>) => MockFilterBuilder<TRow>;
  filter: (
    column: string,
    operator: string,
    value: unknown,
  ) => MockFilterBuilder<TRow>;
  order: (
    column: string,
    options: { ascending: boolean },
  ) => MockFilterBuilder<TRow>;
  range: (from: number, to: number) => MockFilterBuilder<TRow>;
  select: (columns?: string) => MockFilterBuilder<TRow>;
  maybeSingle: () => Promise<MockSingleResponse<TRow>>;
  single: () => Promise<MockSingleResponse<TRow>>;
}

const createFilterBuilder = <TRow>(
  listResponse: MockArrayResponse<TRow>,
  singleResponse?: MockSingleResponse<TRow>,
): MockFilterBuilder<TRow> => {
  const builder = {} as MockFilterBuilder<TRow>;

  builder.eq = vi.fn(() => builder);
  builder.in = vi.fn(() => builder);
  builder.gte = vi.fn(() => builder);
  builder.lte = vi.fn(() => builder);
  builder.is = vi.fn(() => builder);
  builder.not = vi.fn(() => builder);
  builder.match = vi.fn(() => builder);
  builder.filter = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.range = vi.fn(() => builder);
  builder.select = vi.fn(() => builder);

  const resolvedSingleResponse: MockSingleResponse<TRow> = singleResponse ?? {
    data: null,
    error: null,
    status: 200,
  };

  builder.maybeSingle = vi.fn(async () => resolvedSingleResponse);
  builder.single = vi.fn(async () => resolvedSingleResponse);

  builder.then = ((onfulfilled, onrejected) => {
    return Promise.resolve(listResponse).then(onfulfilled, onrejected);
  }) as MockFilterBuilder<TRow>["then"];

  return builder;
};

type SupabaseFromClient = Pick<SupabaseClient, "from">;

const asSupabaseFromClient = (from: unknown): SupabaseFromClient =>
  ({ from }) as unknown as SupabaseFromClient;

const createClient = (supabase: SupabaseFromClient) =>
  new SupabaseDataClient<
    "products",
    ProductDto,
    ProductCommonDto,
    ProductAddDto,
    ProductUpdateDto,
    ProductFilterDto,
    ProductImportPreviewDto,
    ProductRow
  >("products", supabase, {
    nowFactory: () => new Date("2026-01-01T00:00:00.000Z"),
  });

const baseRow: ProductRow = {
  id: 1,
  name: "Laptop",
  categoryId: 9,
  deletedAt: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-02T00:00:00.000Z",
};

describe("SupabaseDataClient", () => {
  it("insert returns inserted dto", async () => {
    const insertBuilder = createFilterBuilder<ProductRow>(
      {
        data: [baseRow],
        error: null,
        status: 201,
      },
      {
        data: baseRow,
        error: null,
        status: 201,
      },
    );

    const insertMock = vi.fn(() => ({
      select: vi.fn(() => insertBuilder),
    }));
    const fromMock = vi.fn(() => ({
      insert: insertMock,
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    const result = await client.insert({ name: "Laptop", categoryId: 9 });

    expect(insertMock).toHaveBeenCalledWith({ name: "Laptop", categoryId: 9 });
    expect(result.id).toBe(1);
    expect(result.name).toBe("Laptop");
  });

  it("update returns 404 when row does not exist", async () => {
    const updateBuilder = createFilterBuilder<ProductRow>(
      {
        data: null,
        error: null,
        status: 200,
      },
      {
        data: null,
        error: null,
        status: 200,
      },
    );

    const fromMock = vi.fn(() => ({
      update: vi.fn(() => updateBuilder),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    await expect(client.update({ id: 7, name: "Updated" })).rejects.toEqual({
      status: 404,
      message: "Record 7 not found",
    });
  });

  it("get applies array/object/range filters and returns QueryResult", async () => {
    const listBuilder = createFilterBuilder<ProductRow>({
      data: [baseRow],
      error: null,
      count: 20,
      status: 200,
    });

    const fromMock = vi.fn(() => ({
      select: vi.fn(() => listBuilder),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    const result = await client.get(
      {
        sortingBy: "name",
        sortingOrder: "DESC" as any,
        currentPage: 1,
        pageSize: 5,
      },
      {
        status: ["active", "draft"],
        category: { id: 9 },
        createdAt: {
          start: "2025-01-01",
          end: "2025-12-31",
        },
      },
    );

    expect(listBuilder.in).toHaveBeenCalledWith("status", ["active", "draft"]);
    expect(listBuilder.eq).toHaveBeenCalledWith("category", 9);
    expect(listBuilder.gte).toHaveBeenCalledWith("createdAt", "2025-01-01");
    expect(listBuilder.lte).toHaveBeenCalledWith("createdAt", "2025-12-31");
    expect(listBuilder.order).toHaveBeenCalledWith("name", {
      ascending: false,
    });
    expect(listBuilder.range).toHaveBeenCalledWith(5, 9);

    expect(result.totalElements).toBe(20);
    expect(result.totalPages).toBe(4);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(1);
  });

  it("get maps softDeleteScope=DELETED to not-is-null", async () => {
    const listBuilder = createFilterBuilder<ProductRow>({
      data: [baseRow],
      error: null,
      count: 1,
      status: 200,
    });

    const fromMock = vi.fn(() => ({
      select: vi.fn(() => listBuilder),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    await client.get(undefined, { softDeleteScope: "DELETED" });

    expect(listBuilder.not).toHaveBeenCalledWith("deletedAt", "is", null);
  });

  it("get maps softDeleteScope=ACTIVE to is-null", async () => {
    const listBuilder = createFilterBuilder<ProductRow>({
      data: [baseRow],
      error: null,
      count: 1,
      status: 200,
    });

    const fromMock = vi.fn(() => ({
      select: vi.fn(() => listBuilder),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    await client.get(undefined, { softDeleteScope: "ACTIVE" });

    expect(listBuilder.is).toHaveBeenCalledWith("deletedAt", null);
  });

  it("get applies deletedAt date filters as ISO equality", async () => {
    const listBuilder = createFilterBuilder<ProductRow>({
      data: [baseRow],
      error: null,
      count: 1,
      status: 200,
    });

    const fromMock = vi.fn(() => ({
      select: vi.fn(() => listBuilder),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));
    const deletedAt = new Date("2026-01-01T00:00:00.000Z");

    await client.get(undefined, { deletedAt });

    expect(listBuilder.eq).toHaveBeenCalledWith(
      "deletedAt",
      "2026-01-01T00:00:00.000Z",
    );
  });

  it("import override=false propagates duplicate conflicts", async () => {
    const importBuilder = createFilterBuilder<ProductRow>({
      data: null,
      error: {
        message: "duplicate key value violates unique constraint",
      },
      status: 409,
    });

    const fromMock = vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => importBuilder),
      })),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    await expect(
      client.import({
        override: false,
        items: [{ id: 1, name: "Duplicated", existing: true }],
      }),
    ).rejects.toEqual({
      status: 409,
      message: "duplicate key value violates unique constraint",
    });
  });

  it("import override=true uses upsert and returns affected row count", async () => {
    const importBuilder = createFilterBuilder<ProductRow>({
      data: [baseRow],
      error: null,
      status: 200,
    });

    const upsertMock = vi.fn(() => ({
      select: vi.fn(() => importBuilder),
    }));

    const fromMock = vi.fn(() => ({
      upsert: upsertMock,
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    const affected = await client.import({
      override: true,
      items: [{ id: 1, name: "Updated", existing: true }],
    });

    expect(upsertMock).toHaveBeenCalledWith(
      [{ id: 1, name: "Updated", existing: true }],
      { onConflict: "id" },
    );
    expect(affected).toBe(1);
  });

  it("export returns filtered rows without pagination", async () => {
    const exportBuilder = createFilterBuilder<ProductRow>({
      data: [baseRow, { ...baseRow, id: 2, name: "Mouse" }],
      error: null,
      status: 200,
    });

    const fromMock = vi.fn(() => ({
      select: vi.fn(() => exportBuilder),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    const rows = await client.export({
      category: { id: 9 },
    });

    expect(exportBuilder.eq).toHaveBeenCalledWith("category", 9);
    expect(rows).toHaveLength(2);
    expect(rows[1]?.name).toBe("Mouse");
  });

  it("softDelete and restore return affected count", async () => {
    const softDeleteBuilder = createFilterBuilder<ProductRow>({
      data: [baseRow, { ...baseRow, id: 2 }],
      error: null,
      status: 200,
    });

    const restoreBuilder = createFilterBuilder<ProductRow>({
      data: [{ ...baseRow, id: 2 }],
      error: null,
      status: 200,
    });

    const updateMock = vi
      .fn()
      .mockReturnValueOnce(softDeleteBuilder)
      .mockReturnValueOnce(restoreBuilder);

    const fromMock = vi.fn(() => ({
      update: updateMock,
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    const deletedCount = await client.softDelete([1, 2]);
    const restoredCount = await client.restore([2]);

    expect(updateMock).toHaveBeenNthCalledWith(1, {
      deletedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(updateMock).toHaveBeenNthCalledWith(2, {
      deletedAt: null,
    });
    expect(deletedCount).toBe(2);
    expect(restoredCount).toBe(1);
  });

  it("getById returns the selected dto", async () => {
    const getByIdBuilder = createFilterBuilder<ProductRow>(
      {
        data: [baseRow],
        error: null,
        status: 200,
      },
      {
        data: baseRow,
        error: null,
        status: 200,
      },
    );

    const fromMock = vi.fn(() => ({
      select: vi.fn(() => getByIdBuilder),
    }));

    const client = createClient(asSupabaseFromClient(fromMock));

    const result = await client.getById(1);

    expect(getByIdBuilder.match).toHaveBeenCalledWith({ id: 1 });
    expect(result.name).toBe("Laptop");
  });
});
