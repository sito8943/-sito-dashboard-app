// services
import { makeRequest, Methods } from "./utils/services";

// types
import {
  BaseEntityDto,
  BaseFilterDto,
  fromLocal,
  QueryParam,
  QueryResult,
} from "lib";

// utils
import { parseQueries } from "./utils";

/**
 * @class APIClient
 * @description it has all base methods
 */
export class APIClient {
  baseUrl: string;
  userKey: string;
  secured: boolean;
  tokenAcquirer!: (useCookie?: boolean) => HeadersInit | undefined;

  /**
   * @param baseUrl the base url of the server
   * @param userKey the local storage user key
   * @param secured if the api client requires token
   * @param tokenAcquirer custom token acquirer
   */
  constructor(
    baseUrl: string,
    userKey = "user",
    secured = true,
    tokenAcquirer = null
  ) {
    this.baseUrl = baseUrl;
    this.secured = secured;
    this.userKey = userKey;
    if (!tokenAcquirer) this.tokenAcquirer = this.defaultTokenAcquirer;
  }

  defaultTokenAcquirer(useCookie?: boolean) {
    if (useCookie) return { credentials: "include" } as HeadersInit;
    const token = fromLocal(this.userKey) as string;
    if (token && token.length)
      return { Authorization: `Bearer ${token}` } as HeadersInit;

    return undefined;
  }

  async doQuery<TResponse, TBody = unknown>(
    endpoint: string,
    method = Methods.GET,
    body?: TBody,
    header?: HeadersInit
  ) {
    const securedHeader = this.secured ? this.defaultTokenAcquirer() : {};
    const { data: result, status } = await makeRequest(
      `${this.baseUrl}${endpoint}`,
      method,
      body,
      {
        ...securedHeader,
        ...(header ?? {}),
      }
    );

    if (status < 200 || status >= 300) throw new Error(String(status));

    return result as TResponse;
  }

  /**
   * @description Get all objects
   * @param endpoint - backed endpoint
   * @param query - query parameters
   * @returns Result list
   */
  async get<TDto extends BaseEntityDto, TFilter extends BaseFilterDto>(
    endpoint: string,
    query?: QueryParam<TDto>,
    filters?: TFilter
  ) {
    const builtUrl = parseQueries<TDto, TFilter>(endpoint, query, filters);

    const securedHeader = this.secured
      ? this.defaultTokenAcquirer()
      : undefined;
    const { data: result, error } = await makeRequest(
      `${this.baseUrl}${builtUrl}`,
      Methods.GET,
      null,
      securedHeader
    );
    if (error) throw new Error(`${error.status} ${error.message}`);

    return result as QueryResult<TDto>;
  }

  /**
   * @description Get entity by id
   * @param endpoint - backed endpoint
   * @param data - data to update
   * @returns updated entity
   */
  async patch<TDto, TUpdateDto>(
    endpoint: string,
    data: TUpdateDto
  ): Promise<TDto> {
    const securedHeader = this.secured
      ? this.defaultTokenAcquirer()
      : undefined;
    const { error, data: result } = await makeRequest<TUpdateDto, TDto>(
      `${this.baseUrl}${endpoint}`,
      Methods.PATCH,
      data,
      securedHeader
    );

    if (error || !result) throw new Error(error?.message);

    return result;
  }

  /**
   * @param endpoint - backend endpoint
   * @param  data - value to insert
   * @returns delete result
   */
  async delete(endpoint: string, data: number[]) {
    const securedHeader = this.secured
      ? this.defaultTokenAcquirer()
      : undefined;
    const { error, data: result } = await makeRequest<number[], number>(
      `${this.baseUrl}${endpoint}`,
      Methods.DELETE,
      data,
      securedHeader
    );

    if (error || !result) throw new Error(error?.message);

    return result;
  }

  /**
   *
   * @param endpoint - backend endpoint
   * @param  data - value to insert
   * @returns inserted item
   */
  async post<TDto, TAddDto>(endpoint: string, data: TAddDto): Promise<TDto> {
    const securedHeader = this.secured
      ? this.defaultTokenAcquirer()
      : undefined;
    const { error, data: result } = await makeRequest<TAddDto, TDto>(
      `${this.baseUrl}${endpoint}`,
      Methods.POST,
      data,
      securedHeader
    );

    if (error || !result)
      throw new Error(error?.message ?? String(error?.status));

    return result;
  }
}
