// services
import {
  makeRequest,
  Methods,
  RequestConfig,
  RequestOptions,
} from "./utils/services";

// types
import {
  BaseEntityDto,
  BaseFilterDto,
  fromLocal,
  removeFromLocal,
  QueryParam,
  QueryResult,
  RefreshDto,
  SessionDto,
  toLocal,
} from "lib";

// utils
import { parseQueries } from "./utils";

export type APIClientAuthConfig = {
  rememberKey?: string;
  refreshTokenKey?: string;
  accessTokenExpiresAtKey?: string;
  refreshEndpoint?: string;
  refreshExpirySkewMs?: number;
};

/**
 * @class APIClient
 * @description it has all base methods
 */
export class APIClient {
  baseUrl: string;
  userKey: string;
  rememberKey: string;
  refreshTokenKey: string;
  accessTokenExpiresAtKey: string;
  refreshEndpoint: string;
  refreshExpirySkewMs: number;
  secured: boolean;
  tokenAcquirer!: (useCookie?: boolean) => RequestConfig | undefined;
  static refreshInFlight: Map<string, Promise<void>> = new Map();

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
    tokenAcquirer?: (useCookie?: boolean) => RequestConfig | undefined,
    authConfig: APIClientAuthConfig = {},
  ) {
    this.baseUrl = baseUrl;
    this.secured = secured;
    this.userKey = userKey;
    this.rememberKey = authConfig.rememberKey ?? "remember";
    this.refreshTokenKey = authConfig.refreshTokenKey ?? "refreshToken";
    this.accessTokenExpiresAtKey =
      authConfig.accessTokenExpiresAtKey ?? "accessTokenExpiresAt";
    this.refreshEndpoint = authConfig.refreshEndpoint ?? "auth/refresh";
    this.refreshExpirySkewMs = authConfig.refreshExpirySkewMs ?? 5000;
    this.tokenAcquirer = tokenAcquirer ?? this.defaultTokenAcquirer;
  }

  defaultTokenAcquirer(useCookie?: boolean): RequestConfig | undefined {
    if (useCookie) return { credentials: "include" };
    const token = fromLocal(this.userKey) as string;
    if (token && token.length) return { Authorization: `Bearer ${token}` };

    return undefined;
  }

  private getRefreshLockKey() {
    return `${this.baseUrl}|${this.userKey}|${this.refreshTokenKey}|${this.accessTokenExpiresAtKey}`;
  }

  private buildUrl(endpoint: string) {
    const trimmedBaseUrl = this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    return `${trimmedBaseUrl}${normalizedEndpoint}`;
  }

  private getRefreshToken() {
    const refreshToken = fromLocal(this.refreshTokenKey);
    if (typeof refreshToken === "string" && refreshToken.length)
      return refreshToken;
    return undefined;
  }

  private getAccessTokenExpiresAt() {
    const accessTokenExpiresAt = fromLocal(this.accessTokenExpiresAtKey);
    if (typeof accessTokenExpiresAt === "string" && accessTokenExpiresAt.length)
      return accessTokenExpiresAt;
    return undefined;
  }

  private canRefresh() {
    return !!this.getRefreshToken();
  }

  private shouldRefreshBeforeRequest() {
    const refreshToken = this.getRefreshToken();
    const accessTokenExpiresAt = this.getAccessTokenExpiresAt();

    if (!refreshToken || !accessTokenExpiresAt) return false;

    const expiresAtTimestamp = Date.parse(accessTokenExpiresAt);
    if (Number.isNaN(expiresAtTimestamp)) return false;

    return Date.now() >= expiresAtTimestamp - this.refreshExpirySkewMs;
  }

  private clearStoredSession() {
    removeFromLocal(this.userKey);
    removeFromLocal(this.rememberKey);
    removeFromLocal(this.refreshTokenKey);
    removeFromLocal(this.accessTokenExpiresAtKey);
  }

  private storeSession(data: SessionDto, fallbackRefreshToken?: string) {
    toLocal(this.userKey, data.token);

    const resolvedRefreshToken =
      data.refreshToken === undefined ? fallbackRefreshToken : data.refreshToken;

    if (
      typeof resolvedRefreshToken === "string" &&
      resolvedRefreshToken.length
    )
      toLocal(this.refreshTokenKey, resolvedRefreshToken);
    else removeFromLocal(this.refreshTokenKey);

    if (
      typeof data.accessTokenExpiresAt === "string" &&
      data.accessTokenExpiresAt.length
    )
      toLocal(this.accessTokenExpiresAtKey, data.accessTokenExpiresAt);
    else removeFromLocal(this.accessTokenExpiresAtKey);
  }

  private async refreshAccessTokenWithMutex() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken)
      throw {
        status: 401,
        message: "Missing refresh token",
      };

    const lockKey = this.getRefreshLockKey();
    const inFlight = APIClient.refreshInFlight.get(lockKey);
    if (inFlight) {
      await inFlight;
      return;
    }

    const refreshPromise = (async () => {
      const { data, status, error } = await makeRequest<RefreshDto, SessionDto>(
        this.buildUrl(this.refreshEndpoint),
        Methods.POST,
        { refreshToken },
      );

      if (error || !data?.token) {
        this.clearStoredSession();
        throw (
          error ?? {
            status,
            message: "Unable to refresh session",
          }
        );
      }

      this.storeSession(data, refreshToken);
    })();

    APIClient.refreshInFlight.set(lockKey, refreshPromise);
    try {
      await refreshPromise;
    } finally {
      APIClient.refreshInFlight.delete(lockKey);
    }
  }

  private isRequestOptions(config: RequestConfig): config is RequestOptions {
    if (Array.isArray(config)) return false;
    if (config instanceof Headers) return false;
    return (
      typeof config === "object" &&
      config !== null &&
      ("headers" in config || "credentials" in config)
    );
  }

  private toRequestOptions(config?: RequestConfig): RequestOptions {
    if (!config) return {};
    if (this.isRequestOptions(config)) return config;
    return { headers: config };
  }

  private toHeaderRecord(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};
    if (headers instanceof Headers)
      return Object.fromEntries(headers.entries());
    if (Array.isArray(headers)) return Object.fromEntries(headers);
    return headers;
  }

  private mergeRequestConfig(
    config?: RequestConfig,
  ): RequestConfig | undefined {
    const securedConfig = this.secured ? this.tokenAcquirer() : undefined;
    const securedOptions = this.toRequestOptions(securedConfig);
    const customOptions = this.toRequestOptions(config);

    const mergedHeaders = {
      ...this.toHeaderRecord(securedOptions.headers),
      ...this.toHeaderRecord(customOptions.headers),
    };

    const credentials = customOptions.credentials ?? securedOptions.credentials;
    const hasHeaders = Object.keys(mergedHeaders).length > 0;

    if (credentials)
      return hasHeaders
        ? { headers: mergedHeaders, credentials }
        : { credentials };

    if (hasHeaders) return mergedHeaders;
    return undefined;
  }

  private async makeRequestWithRefresh<TResponse, TBody = unknown>(
    endpoint: string,
    method: Methods,
    body?: TBody,
    requestConfig?: RequestConfig,
  ) {
    if (this.secured && this.shouldRefreshBeforeRequest())
      await this.refreshAccessTokenWithMutex();

    let response = await makeRequest<TBody, TResponse>(
      this.buildUrl(endpoint),
      method,
      body,
      this.mergeRequestConfig(requestConfig),
    );

    if (this.secured && response.status === 401 && this.canRefresh()) {
      await this.refreshAccessTokenWithMutex();
      response = await makeRequest<TBody, TResponse>(
        this.buildUrl(endpoint),
        method,
        body,
        this.mergeRequestConfig(requestConfig),
      );
    }

    return response;
  }

  async doQuery<TResponse, TBody = unknown>(
    endpoint: string,
    method = Methods.GET,
    body?: TBody,
    requestConfig?: RequestConfig,
  ) {
    const {
      data: result,
      status,
      error,
    } = await this.makeRequestWithRefresh<TResponse, TBody>(
      endpoint,
      method,
      body,
      requestConfig,
    );

    if (error || status < 200 || status >= 300)
      throw (
        error ?? {
          status,
          message: String(status),
        }
      );

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
    filters?: TFilter,
  ) {
    const builtUrl = parseQueries<TDto, TFilter>(endpoint, query, filters);

    const { data: result, error } = await this.makeRequestWithRefresh<
      QueryResult<TDto>
    >(builtUrl, Methods.GET);
    if (error) throw error;

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
    data: TUpdateDto,
  ): Promise<TDto> {
    const {
      error,
      data: result,
      status,
    } = await this.makeRequestWithRefresh<TDto, TUpdateDto>(
      endpoint,
      Methods.PATCH,
      data,
    );

    if (error || result === null || result === undefined)
      throw (
        error ?? {
          status,
          message: "Unknown error",
        }
      );

    return result;
  }

  /**
   * @param endpoint - backend endpoint
   * @param  data - value to insert
   * @returns delete result
   */
  async delete(endpoint: string, data: number[]) {
    const {
      error,
      data: result,
      status,
    } = await this.makeRequestWithRefresh<number, number[]>(
      endpoint,
      Methods.DELETE,
      data,
    );

    if (error || result === null || result === undefined)
      throw (
        error ?? {
          status,
          message: "Unknown error",
        }
      );

    return result;
  }

  /**
   *
   * @param endpoint - backend endpoint
   * @param  data - value to insert
   * @returns inserted item
   */
  async post<TDto, TAddDto>(endpoint: string, data: TAddDto): Promise<TDto> {
    const {
      error,
      data: result,
      status,
    } = await this.makeRequestWithRefresh<TDto, TAddDto>(
      endpoint,
      Methods.POST,
      data,
    );

    if (error || result === null || result === undefined)
      throw (
        error ?? {
          status,
          message: "Unknown error",
        }
      );

    return result;
  }
}
