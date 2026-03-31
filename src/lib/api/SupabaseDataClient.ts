import type { SupabaseClient } from "@supabase/supabase-js";

import type { QueryParam, QueryResult } from "./types";

import {
  BaseCommonEntityDto,
  BaseEntityDto,
  BaseFilterDto,
  DeleteDto,
  ImportDto,
  ImportPreviewDto,
  SoftDeleteScope,
} from "lib";

type SupabaseErrorLike = {
  message: string;
};

type SupabaseArrayResponse<TRow> = {
  data: TRow[] | null;
  error: SupabaseErrorLike | null;
  count?: number | null;
  status?: number;
  statusText?: string;
};

type SupabaseSingleResponse<TRow> = {
  data: TRow | null;
  error: SupabaseErrorLike | null;
  status?: number;
  statusText?: string;
};

type RangeFilterValue = {
  start?: unknown;
  end?: unknown;
};

type FilterBuilder<TBuilder> = {
  eq: (column: string, value: unknown) => TBuilder;
  in: (column: string, values: unknown[]) => TBuilder;
  gte: (column: string, value: unknown) => TBuilder;
  lte: (column: string, value: unknown) => TBuilder;
  is: (column: string, value: null) => TBuilder;
  not: (column: string, operator: string, value: unknown) => TBuilder;
};

export type SupabaseDataClientOptions<
  TDto,
  TCommonDto,
  TAddDto,
  TUpdateDto,
  TImportPreviewDto,
  TRow extends Record<string, unknown>,
  TCommonRow extends Record<string, unknown> = TRow,
> = {
  idColumn?: keyof TRow & string;
  deletedAtColumn?: keyof TRow & string;
  defaultSortColumn?: keyof TRow & string;
  mapRowToDto?: (row: TRow) => TDto;
  mapRowToCommonDto?: (row: TCommonRow) => TCommonDto;
  mapAddDtoToRow?: (value: TAddDto) => Partial<TRow>;
  mapUpdateDtoToRow?: (value: TUpdateDto) => Partial<TRow>;
  mapImportPreviewToRow?: (value: TImportPreviewDto) => Partial<TRow>;
  nowFactory?: () => Date;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const hasRangeShape = (value: unknown): value is RangeFilterValue => {
  if (!isRecord(value)) return false;
  return "start" in value || "end" in value;
};

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

const normalizeScalarValue = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  return value;
};

const resolveSoftDeleteScope = (
  value: unknown,
): SoftDeleteScope | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  if (normalized === "ACTIVE") return "ACTIVE";
  if (normalized === "DELETED") return "DELETED";
  if (normalized === "ALL") return "ALL";
  return undefined;
};

/** Generic Supabase data client aligned with BaseClient behavior. */
export class SupabaseDataClient<
  Tables extends string,
  TDto extends BaseEntityDto,
  TCommonDto extends BaseCommonEntityDto,
  TAddDto,
  TUpdateDto extends DeleteDto,
  TFilter extends BaseFilterDto,
  TImportPreviewDto extends ImportPreviewDto,
  TRow extends Record<string, unknown> = Record<string, unknown>,
  TCommonRow extends Record<string, unknown> = TRow,
> {
  table: Tables;
  supabase: Pick<SupabaseClient, "from">;
  idColumn: keyof TRow & string;
  deletedAtColumn: keyof TRow & string;
  defaultSortColumn: keyof TRow & string;
  options: SupabaseDataClientOptions<
    TDto,
    TCommonDto,
    TAddDto,
    TUpdateDto,
    TImportPreviewDto,
    TRow,
    TCommonRow
  >;

  constructor(
    table: Tables,
    supabase: Pick<SupabaseClient, "from">,
    options: SupabaseDataClientOptions<
      TDto,
      TCommonDto,
      TAddDto,
      TUpdateDto,
      TImportPreviewDto,
      TRow,
      TCommonRow
    > = {},
  ) {
    this.table = table;
    this.supabase = supabase;
    this.options = options;
    this.idColumn = (options.idColumn ?? "id") as keyof TRow & string;
    this.deletedAtColumn = (options.deletedAtColumn ??
      "deletedAt") as keyof TRow & string;
    this.defaultSortColumn = (options.defaultSortColumn ??
      this.idColumn) as keyof TRow & string;
  }

  private resolveStatus(status?: number): number {
    return typeof status === "number" && Number.isFinite(status) ? status : 500;
  }

  private throwHttpError(
    error: SupabaseErrorLike | null,
    status?: number,
    statusText?: string,
    fallbackMessage = "Unknown error",
  ): never {
    throw {
      status: this.resolveStatus(status),
      message: error?.message || statusText || fallbackMessage,
    };
  }

  private assertNoError(
    error: SupabaseErrorLike | null,
    status?: number,
    statusText?: string,
    fallbackMessage?: string,
  ) {
    if (!error) return;
    this.throwHttpError(error, status, statusText, fallbackMessage);
  }

  private toDto(row: TRow): TDto {
    if (this.options.mapRowToDto) return this.options.mapRowToDto(row);
    return row as unknown as TDto;
  }

  private toCommonDto(row: TCommonRow): TCommonDto {
    if (this.options.mapRowToCommonDto)
      return this.options.mapRowToCommonDto(row);
    return row as unknown as TCommonDto;
  }

  private toAddRow(value: TAddDto): Partial<TRow> {
    if (this.options.mapAddDtoToRow) return this.options.mapAddDtoToRow(value);
    return value as unknown as Partial<TRow>;
  }

  private toUpdateRow(value: TUpdateDto): Partial<TRow> {
    if (this.options.mapUpdateDtoToRow)
      return this.options.mapUpdateDtoToRow(value);
    return value as unknown as Partial<TRow>;
  }

  private toImportRow(value: TImportPreviewDto): Partial<TRow> {
    if (this.options.mapImportPreviewToRow)
      return this.options.mapImportPreviewToRow(value);
    return value as unknown as Partial<TRow>;
  }

  private resolveObjectFilterValue(value: Record<string, unknown>): unknown {
    if ("id" in value) return normalizeScalarValue(value.id);
    return "";
  }

  private applyFilters<TBuilder extends FilterBuilder<TBuilder>>(
    builder: TBuilder,
    filters?: TFilter,
  ): TBuilder {
    if (!filters) return builder;

    let scopedBuilder = builder;
    const softDeleteScope = resolveSoftDeleteScope(filters.softDeleteScope);
    if (softDeleteScope === "ACTIVE")
      scopedBuilder = scopedBuilder.is(this.deletedAtColumn, null);
    else if (softDeleteScope === "DELETED")
      scopedBuilder = scopedBuilder.not(this.deletedAtColumn, "is", null);

    Object.entries(filters).forEach(([key, filterValue]) => {
      if (
        key === "softDeleteScope" ||
        filterValue === undefined ||
        filterValue === null ||
        filterValue === ""
      )
        return;

      const column = key === "deletedAt" ? this.deletedAtColumn : key;

      if (Array.isArray(filterValue)) {
        const values = filterValue
          .map((item) => {
            if (item instanceof Date) return item.toISOString();
            if (isRecord(item)) return this.resolveObjectFilterValue(item);
            return normalizeScalarValue(item);
          })
          .filter(isDefined);

        if (values.length > 0) scopedBuilder = scopedBuilder.in(column, values);
        return;
      }

      if (hasRangeShape(filterValue)) {
        if (filterValue.start !== undefined && filterValue.start !== "")
          scopedBuilder = scopedBuilder.gte(
            column,
            normalizeScalarValue(filterValue.start),
          );

        if (filterValue.end !== undefined && filterValue.end !== "")
          scopedBuilder = scopedBuilder.lte(
            column,
            normalizeScalarValue(filterValue.end),
          );
        return;
      }

      if (filterValue instanceof Date) {
        scopedBuilder = scopedBuilder.eq(column, filterValue.toISOString());
        return;
      }

      if (isRecord(filterValue)) {
        scopedBuilder = scopedBuilder.eq(
          column,
          this.resolveObjectFilterValue(filterValue),
        );
        return;
      }

      scopedBuilder = scopedBuilder.eq(
        column,
        normalizeScalarValue(filterValue),
      );
    });

    return scopedBuilder;
  }

  async insert(value: TAddDto): Promise<TDto> {
    const response = (await this.supabase
      .from(this.table)
      .insert(this.toAddRow(value))
      .select("*")
      .single()) as SupabaseSingleResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to insert",
    );

    if (!response.data)
      this.throwHttpError(
        null,
        response.status,
        response.statusText,
        "Unable to insert",
      );

    return this.toDto(response.data);
  }

  async insertMany(data: TAddDto[]): Promise<TDto> {
    if (data.length === 0)
      this.throwHttpError(null, 400, undefined, "insertMany requires items");

    const payload = data.map((item) => this.toAddRow(item));

    const response = (await this.supabase
      .from(this.table)
      .insert(payload)
      .select("*")) as SupabaseArrayResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to insert many rows",
    );

    const last = response.data?.at(-1);
    if (!last)
      this.throwHttpError(
        null,
        response.status,
        response.statusText,
        "Unable to insert many rows",
      );

    return this.toDto(last);
  }

  async update(value: TUpdateDto): Promise<TDto> {
    const idMatch = {
      [this.idColumn]: value.id,
    } as Record<string, unknown>;

    const response = (await this.supabase
      .from(this.table)
      .update(this.toUpdateRow(value))
      .match(idMatch)
      .select("*")
      .maybeSingle()) as SupabaseSingleResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to update",
    );

    if (!response.data)
      this.throwHttpError(
        null,
        404,
        response.statusText,
        `Record ${value.id} not found`,
      );

    return this.toDto(response.data);
  }

  async get(
    query?: QueryParam<TDto>,
    filters?: TFilter,
  ): Promise<QueryResult<TDto>> {
    const pageSize = query?.pageSize ?? 10;
    const currentPage = query?.currentPage ?? 0;
    const sortingBy = String(query?.sortingBy ?? this.defaultSortColumn);
    const sortingOrder =
      String(query?.sortingOrder ?? "asc").toLowerCase() === "desc"
        ? "desc"
        : "asc";

    const from = currentPage * pageSize;
    const to = from + pageSize - 1;

    let scopedQuery = this.supabase.from(this.table).select("*", {
      count: "exact",
    });

    scopedQuery = this.applyFilters(scopedQuery, filters)
      .order(sortingBy, { ascending: sortingOrder === "asc" })
      .range(from, to);

    const response = (await scopedQuery) as SupabaseArrayResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to load list",
    );

    const items = (response.data ?? []).map((item) => this.toDto(item));
    const totalElements = response.count ?? items.length;

    return {
      sort: sortingBy as keyof TDto,
      order: sortingOrder,
      currentPage,
      pageSize,
      totalElements,
      totalPages: pageSize > 0 ? Math.ceil(totalElements / pageSize) : 0,
      items,
    };
  }

  async export(filters?: TFilter): Promise<TDto[]> {
    let scopedQuery = this.supabase.from(this.table).select("*");
    scopedQuery = this.applyFilters(scopedQuery, filters);

    const response = (await scopedQuery) as SupabaseArrayResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to export",
    );

    return (response.data ?? []).map((item) => this.toDto(item));
  }

  async import(data: ImportDto<TImportPreviewDto>): Promise<number> {
    if (data.items.length === 0) return 0;

    const payload = data.items.map((item) => this.toImportRow(item));

    const query = data.override
      ? this.supabase
          .from(this.table)
          .upsert(payload, { onConflict: this.idColumn })
          .select(this.idColumn)
      : this.supabase.from(this.table).insert(payload).select(this.idColumn);

    const response = (await query) as SupabaseArrayResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to import rows",
    );

    return response.data?.length ?? 0;
  }

  async commonGet(query: TFilter): Promise<TCommonDto[]> {
    let scopedQuery = this.supabase.from(this.table).select("*");
    scopedQuery = this.applyFilters(scopedQuery, query);

    const response = (await scopedQuery) as SupabaseArrayResponse<TCommonRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to load common data",
    );

    return (response.data ?? []).map((item) => this.toCommonDto(item));
  }

  async getById(id: number): Promise<TDto> {
    const idMatch = {
      [this.idColumn]: id,
    } as Record<string, unknown>;

    const response = (await this.supabase
      .from(this.table)
      .select("*")
      .match(idMatch)
      .maybeSingle()) as SupabaseSingleResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to load item",
    );

    if (!response.data)
      this.throwHttpError(
        null,
        404,
        response.statusText,
        `Record ${id} not found`,
      );

    return this.toDto(response.data);
  }

  async softDelete(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;

    const deletedAt =
      this.options.nowFactory?.().toISOString() ?? new Date().toISOString();

    const updateQuery = this.supabase.from(this.table).update({
      [this.deletedAtColumn]: deletedAt,
    } as Record<string, unknown>);

    const inFilterValue = `(${ids.join(",")})`;

    const response = (await updateQuery
      .filter(this.idColumn, "in", inFilterValue)
      .select(this.idColumn)) as SupabaseArrayResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to soft delete",
    );

    return response.data?.length ?? 0;
  }

  async restore(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;

    const updateQuery = this.supabase
      .from(this.table)
      .update({ [this.deletedAtColumn]: null } as Record<string, unknown>);

    const inFilterValue = `(${ids.join(",")})`;

    const response = (await updateQuery
      .filter(this.idColumn, "in", inFilterValue)
      .select(this.idColumn)) as SupabaseArrayResponse<TRow>;

    this.assertNoError(
      response.error,
      response.status,
      response.statusText,
      "Unable to restore",
    );

    return response.data?.length ?? 0;
  }
}
