// @sito/dashboard
import { SortOrder } from "@sito/dashboard";
import type { RequestConfig } from "./utils/services";

export type APIError = {
  kind: string;
  message: string;
};

export type QueryResult<TDto> = {
  sort: keyof TDto;
  order: "asc" | "desc";
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  items: TDto[];
};

export type QueryParam<TDto> = {
  sortingBy?: keyof TDto;
  sortingOrder?: SortOrder;
  currentPage?: number;
  pageSize?: number;
};

export type RangeValue<T> = {
  start: T;
  end: T;
};

export type APIClientAuthConfig = {
  rememberKey?: string;
  refreshTokenKey?: string;
  accessTokenExpiresAtKey?: string;
  refreshEndpoint?: string;
  refreshExpirySkewMs?: number;
  refreshMaxRetries?: number;
  refreshRetryDelayMs?: number;
  refreshRetryBackoffMultiplier?: number;
  refreshRetryCooldownMs?: number;
};

export type APIClientAuthMode = "none" | "access-token";

export type APIClientRequestOptions = {
  authMode?: APIClientAuthMode;
  requestConfig?: RequestConfig;
};
