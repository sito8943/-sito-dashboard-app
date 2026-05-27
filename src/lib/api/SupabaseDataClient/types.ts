import type { SupabaseClient } from "@supabase/supabase-js";

export type SupabaseErrorLike = {
  message: string;
};

export type SupabaseArrayResponse<TRow> = {
  data: TRow[] | null;
  error: SupabaseErrorLike | null;
  count?: number | null;
  status?: number;
  statusText?: string;
};

export type SupabaseSingleResponse<TRow> = {
  data: TRow | null;
  error: SupabaseErrorLike | null;
  status?: number;
  statusText?: string;
};

export type RangeFilterValue = {
  start?: unknown;
  end?: unknown;
};

export type FilterBuilder<TBuilder> = {
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

export type SupabaseFromClient = Pick<SupabaseClient, "from">;
