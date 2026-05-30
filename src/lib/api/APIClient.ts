// services
import {
  makeRequest,
  Methods,
  RequestConfig,
  RequestOptions,
  ResponseValidator,
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
import {
  APIClientAuthConfig,
  APIClientAuthMode,
  APIClientRequestOptions,
} from "./types";
import {
  isDefinitiveAuthSessionError,
  isRetryableAuthSessionError,
  normalizeAuthSessionError,
} from "./authSessionError";

// utils
import { parseQueries } from "./utils";

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
  refreshMaxRetries: number;
  refreshRetryDelayMs: number;
  refreshRetryBackoffMultiplier: number;
  refreshRetryCooldownMs: number;
  defaultAuthMode: APIClientAuthMode;
  /** @deprecated Use per-request `authMode` instead. */
  secured: boolean;
  tokenAcquirer!: (useCookie?: boolean) => RequestConfig | undefined;
  static refreshInFlight: Map<string, Promise<void>> = new Map();
  static refreshCooldowns: Map<
    string,
    {
      until: number;
      error: { status: number; message: string };
      refreshToken: string;
    }
  > = new Map();

  /**
   * @param baseUrl the base url of the server
   * @param userKey the local storage user key
   * @param secured - Deprecated. Sets the default auth mode for requests when
   * no per-request `authMode` override is provided.
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
    this.defaultAuthMode = secured ? "access-token" : "none";
    /** @deprecated Use per-request `authMode` instead. */
    this.secured = secured;
    this.userKey = userKey;
    this.rememberKey = authConfig.rememberKey ?? "remember";
    this.refreshTokenKey = authConfig.refreshTokenKey ?? "refreshToken";
    this.accessTokenExpiresAtKey =
      authConfig.accessTokenExpiresAtKey ?? "accessTokenExpiresAt";
    this.refreshEndpoint = authConfig.refreshEndpoint ?? "auth/refresh";
    this.refreshExpirySkewMs = authConfig.refreshExpirySkewMs ?? 5000;
    this.refreshMaxRetries = authConfig.refreshMaxRetries ?? 2;
    this.refreshRetryDelayMs = authConfig.refreshRetryDelayMs ?? 400;
    this.refreshRetryBackoffMultiplier =
      authConfig.refreshRetryBackoffMultiplier ?? 3;
    this.refreshRetryCooldownMs = authConfig.refreshRetryCooldownMs ?? 20000;
    this.tokenAcquirer = tokenAcquirer ?? this.defaultTokenAcquirer;
  }

  defaultTokenAcquirer(useCookie?: boolean): RequestConfig | undefined {
    if (useCookie) return { credentials: "include" };
    const token = fromLocal(this.userKey);
    if (typeof token === "string" && token.length)
      return { Authorization: `Bearer ${token}` };

    return undefined;
  }

  private isSessionDto(value: unknown): value is SessionDto {
    if (typeof value !== "object" || value === null) return false;
    const maybe = value as Partial<SessionDto>;
    const hasOptionalRefresh =
      maybe.refreshToken === undefined ||
      maybe.refreshToken === null ||
      typeof maybe.refreshToken === "string";
    const hasOptionalExpiresAt =
      maybe.accessTokenExpiresAt === undefined ||
      maybe.accessTokenExpiresAt === null ||
      typeof maybe.accessTokenExpiresAt === "string";
    return (
      typeof maybe.id === "number" &&
      typeof maybe.username === "string" &&
      typeof maybe.email === "string" &&
      typeof maybe.token === "string" &&
      maybe.token.length > 0 &&
      hasOptionalRefresh &&
      hasOptionalExpiresAt
    );
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

  private getAccessTokenExpiryTimestamp() {
    const accessTokenExpiresAt = this.getAccessTokenExpiresAt();
    if (!accessTokenExpiresAt) return undefined;

    const expiresAtTimestamp = Date.parse(accessTokenExpiresAt);
    if (Number.isNaN(expiresAtTimestamp)) return undefined;

    return expiresAtTimestamp;
  }

  private isAccessTokenExpired() {
    const expiresAtTimestamp = this.getAccessTokenExpiryTimestamp();
    if (expiresAtTimestamp === undefined) return false;
    return Date.now() >= expiresAtTimestamp;
  }

  private async waitForRefreshRetry(attempt: number) {
    if (this.refreshRetryDelayMs <= 0) return;

    const delay =
      this.refreshRetryDelayMs *
      this.refreshRetryBackoffMultiplier ** Math.max(0, attempt);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  private getRefreshCooldown(refreshToken: string) {
    const cooldown = APIClient.refreshCooldowns.get(this.getRefreshLockKey());
    if (!cooldown) return undefined;
    if (
      cooldown.refreshToken !== refreshToken ||
      Date.now() >= cooldown.until
    ) {
      APIClient.refreshCooldowns.delete(this.getRefreshLockKey());
      return undefined;
    }

    return cooldown;
  }

  private setRefreshCooldown(
    refreshToken: string,
    error: { status: number; message: string },
  ) {
    if (this.refreshRetryCooldownMs <= 0) return;

    APIClient.refreshCooldowns.set(this.getRefreshLockKey(), {
      until: Date.now() + this.refreshRetryCooldownMs,
      error,
      refreshToken,
    });
  }

  private clearRefreshCooldown() {
    APIClient.refreshCooldowns.delete(this.getRefreshLockKey());
  }

  private storeSession(data: SessionDto, fallbackRefreshToken?: string) {
    toLocal(this.userKey, data.token);
    this.clearRefreshCooldown();

    const resolvedRefreshToken =
      data.refreshToken === undefined
        ? fallbackRefreshToken
        : data.refreshToken;

    if (typeof resolvedRefreshToken === "string" && resolvedRefreshToken.length)
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

    const cooldown = this.getRefreshCooldown(refreshToken);
    if (cooldown) throw cooldown.error;

    const lockKey = this.getRefreshLockKey();
    const inFlight = APIClient.refreshInFlight.get(lockKey);
    if (inFlight) {
      await inFlight;
      return;
    }

    const refreshPromise = (async () => {
      let attempt = 0;

      while (attempt <= this.refreshMaxRetries) {
        const { data, status, error } = await makeRequest<
          RefreshDto,
          SessionDto
        >(
          this.buildUrl(this.refreshEndpoint),
          Methods.POST,
          { refreshToken },
          undefined,
          (value): value is SessionDto => this.isSessionDto(value),
        );

        if (data?.token) {
          this.storeSession(data, refreshToken);
          return;
        }

        const refreshError = normalizeAuthSessionError(
          error ?? {
            status,
            message: "Unable to refresh session",
          },
        );

        if (isDefinitiveAuthSessionError(refreshError)) {
          this.clearRefreshCooldown();
          this.clearStoredSession();
          throw refreshError;
        }

        if (
          isRetryableAuthSessionError(refreshError) &&
          attempt < this.refreshMaxRetries
        ) {
          await this.waitForRefreshRetry(attempt);
          attempt += 1;
          continue;
        }

        this.setRefreshCooldown(refreshToken, refreshError);
        throw refreshError;
      }
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

  private isAPIClientRequestOptions(
    config?: RequestConfig | APIClientRequestOptions,
  ): config is APIClientRequestOptions {
    return (
      typeof config === "object" &&
      config !== null &&
      ("authMode" in config || "requestConfig" in config)
    );
  }

  private resolveAuthMode(
    config?: RequestConfig | APIClientRequestOptions,
  ): APIClientAuthMode {
    if (!this.isAPIClientRequestOptions(config) || !config.authMode)
      return this.defaultAuthMode;
    return config.authMode;
  }

  private resolveRequestConfig(
    config?: RequestConfig | APIClientRequestOptions,
  ): RequestConfig | undefined {
    if (!this.isAPIClientRequestOptions(config)) return config;
    return config.requestConfig;
  }

  private mergeRequestConfig(
    authMode: APIClientAuthMode,
    config?: RequestConfig,
  ): RequestConfig | undefined {
    const securedConfig =
      authMode === "access-token" ? this.tokenAcquirer() : undefined;
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
    authMode: APIClientAuthMode = this.defaultAuthMode,
    requestConfig?: RequestConfig,
    responseValidator?: ResponseValidator<TResponse>,
  ) {
    if (authMode === "access-token" && this.shouldRefreshBeforeRequest()) {
      try {
        await this.refreshAccessTokenWithMutex();
      } catch (error) {
        if (isDefinitiveAuthSessionError(error) || this.isAccessTokenExpired())
          throw error;
      }
    }

    let response = await makeRequest<TBody, TResponse>(
      this.buildUrl(endpoint),
      method,
      body,
      this.mergeRequestConfig(authMode, requestConfig),
      responseValidator,
    );

    if (
      authMode === "access-token" &&
      response.status === 401 &&
      this.canRefresh()
    ) {
      await this.refreshAccessTokenWithMutex();
      response = await makeRequest<TBody, TResponse>(
        this.buildUrl(endpoint),
        method,
        body,
        this.mergeRequestConfig(authMode, requestConfig),
        responseValidator,
      );
    }

    return response;
  }

  async doQuery<TResponse, TBody = unknown>(
    endpoint: string,
    method = Methods.GET,
    body?: TBody,
    requestConfig?: RequestConfig | APIClientRequestOptions,
  ) {
    const authMode = this.resolveAuthMode(requestConfig);
    const resolvedRequestConfig = this.resolveRequestConfig(requestConfig);
    const {
      data: result,
      status,
      error,
    } = await this.makeRequestWithRefresh<TResponse, TBody>(
      endpoint,
      method,
      body,
      authMode,
      resolvedRequestConfig,
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
    options?: APIClientRequestOptions,
  ) {
    const builtUrl = parseQueries<TDto, TFilter>(endpoint, query, filters);
    const authMode = this.resolveAuthMode(options);
    const requestConfig = this.resolveRequestConfig(options);

    const {
      data: result,
      error,
      status,
    } = await this.makeRequestWithRefresh<QueryResult<TDto>>(
      builtUrl,
      Methods.GET,
      undefined,
      authMode,
      requestConfig,
    );
    if (error || status < 200 || status >= 300 || !result)
      throw (
        error ?? {
          status,
          message: String(status),
        }
      );

    return result;
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
    options?: APIClientRequestOptions,
  ): Promise<TDto> {
    const authMode = this.resolveAuthMode(options);
    const requestConfig = this.resolveRequestConfig(options);
    const {
      error,
      data: result,
      status,
    } = await this.makeRequestWithRefresh<TDto, TUpdateDto>(
      endpoint,
      Methods.PATCH,
      data,
      authMode,
      requestConfig,
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
  async delete(
    endpoint: string,
    data: number[],
    options?: APIClientRequestOptions,
  ) {
    const authMode = this.resolveAuthMode(options);
    const requestConfig = this.resolveRequestConfig(options);
    const {
      error,
      data: result,
      status,
    } = await this.makeRequestWithRefresh<number, number[]>(
      endpoint,
      Methods.DELETE,
      data,
      authMode,
      requestConfig,
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
  async post<TDto, TAddDto>(
    endpoint: string,
    data: TAddDto,
    options?: APIClientRequestOptions,
  ): Promise<TDto> {
    const authMode = this.resolveAuthMode(options);
    const requestConfig = this.resolveRequestConfig(options);
    const {
      error,
      data: result,
      status,
    } = await this.makeRequestWithRefresh<TDto, TAddDto>(
      endpoint,
      Methods.POST,
      data,
      authMode,
      requestConfig,
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
