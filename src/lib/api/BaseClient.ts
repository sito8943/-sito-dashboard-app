// api client
import { APIClient } from "./APIClient";
import type { APIClientAuthConfig } from "./types";

// types
import { QueryParam } from "./types";

// lib
import {
  BaseCommonEntityDto,
  BaseEntityDto,
  BaseFilterDto,
  buildQueryUrl,
  DeleteDto,
  ImportDto,
  ImportPreviewDto,
  Methods,
  QueryResult,
} from "lib";
import { parseQueries } from "./utils/query";

/** Generic REST client with CRUD, import/export and common list operations. */
export class BaseClient<
  Tables,
  TDto extends BaseEntityDto,
  TCommonDto extends BaseCommonEntityDto,
  TAddDto,
  TUpdateDto extends DeleteDto,
  TFilter extends BaseFilterDto,
  TImportPreviewDto extends ImportPreviewDto,
  TMutationOutputDto = TDto,
  TGetByIdDto = TDto,
> {
  table: Tables;
  /** @deprecated Use `api` request-level `authMode` overrides instead. */
  secured: boolean;
  api: APIClient;
  /**
   * @param table - Resource table/endpoint name.
   * @param baseUrl - API base URL.
   * @param userKey - Storage key for user session data.
   * @param secured - Deprecated. Sets the default auth mode for this client.
   * Prefer request-level `authMode` overrides on `api`.
   * @param authConfig - Custom auth storage key configuration.
   */
  constructor(
    table: Tables,
    baseUrl: string,
    userKey: string = "user",
    secured: boolean = true,
    authConfig: APIClientAuthConfig = {},
  ) {
    this.table = table;
    /** @deprecated Use `api` request-level `authMode` overrides instead. */
    this.secured = secured;
    this.api = new APIClient(baseUrl, userKey, secured, undefined, authConfig);
  }

  /**
   *
   * @param value
   * @returns inserted item
   */
  async insert(value: TAddDto): Promise<TMutationOutputDto> {
    return await this.api.post<TMutationOutputDto, TAddDto>(
      `${this.table}`,
      value,
    );
  }

  /**
   *
   * @param data - values to insert
   * @returns - Query result
   */
  async insertMany(data: TAddDto[]): Promise<TMutationOutputDto> {
    return await this.api.doQuery<TMutationOutputDto, TAddDto[]>(
      `${this.table}/batch`,
      Methods.POST,
      data,
    );
  }

  /**
   *
   * @param value
   * @returns updated item
   */
  async update(value: TUpdateDto): Promise<TMutationOutputDto> {
    return await this.api.patch<TMutationOutputDto, TUpdateDto>(
      `${this.table}/${value.id}`,
      value,
    );
  }

  /**
   *
   * @param query - Where conditions (key-value)
   * @param filters - Filters to apply
   * @returns - Query result
   */
  async get(
    query?: QueryParam<TDto>,
    filters?: TFilter,
  ): Promise<QueryResult<TDto>> {
    return await this.api.get<TDto, TFilter>(`${this.table}`, query, filters);
  }

  /**
   *
   * @param filters - Filters to apply
   * @returns - List of elements
   */
  async export(filters?: TFilter): Promise<TDto[]> {
    const builtUrl = parseQueries<TDto, TFilter>(
      `${this.table}/export`,
      undefined,
      filters,
    );

    return await this.api.doQuery<TDto[]>(builtUrl, Methods.GET, undefined);
  }

  /**
   *
   * @param data - Import data
   * @returns - List of elements
   */
  async import(data: ImportDto<TImportPreviewDto>): Promise<number> {
    return await this.api.doQuery<number>(
      `${this.table}/import`,
      Methods.POST,
      data,
    );
  }

  /**
   *
   * @param query - Where conditions (key-value)
   * @returns  - Query result
   */
  async commonGet(query: TFilter): Promise<TCommonDto[]> {
    return await this.api.doQuery<TCommonDto[], TFilter>(
      buildQueryUrl<TFilter>(`${this.table}/common`, query),
      Methods.GET,
    );
  }

  /**
   *
   * @param id
   * @returns - Query result
   */
  async getById(id: number): Promise<TGetByIdDto> {
    return await this.api.doQuery<TGetByIdDto>(`${this.table}/${id}`);
  }

  async softDelete(ids: number[]): Promise<number> {
    return await this.api.delete(`${this.table}`, ids);
  }

  async restore(ids: number[]): Promise<number> {
    return await this.api.patch(`${this.table}/restore`, ids);
  }
}
