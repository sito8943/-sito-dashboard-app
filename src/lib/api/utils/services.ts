// types
import { HttpResponse } from "./types";

/** Supported HTTP verbs for API requests. */
export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export type RequestOptions = {
  headers?: HeadersInit;
  credentials?: RequestCredentials;
};

export type RequestConfig = HeadersInit | RequestOptions;

const isRequestOptions = (config: RequestConfig): config is RequestOptions => {
  if (Array.isArray(config)) return false;
  if (config instanceof Headers) return false;
  return (
    typeof config === "object" &&
    config !== null &&
    ("headers" in config || "credentials" in config)
  );
};

const toRequestOptions = (config?: RequestConfig): RequestOptions => {
  if (!config) return {};
  if (isRequestOptions(config)) return config;
  return { headers: config };
};

const toHeaderRecord = (headers?: HeadersInit): Record<string, string> => {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
};

const getObjectValue = (value: unknown, key: string): unknown => {
  if (typeof value !== "object" || value === null) return undefined;
  return (value as Record<string, unknown>)[key];
};

/**
 * @description Make a request to the API
 * @param url - URL to make the request
 * @param method - Request method
 * @param body - Request body
 * @param requestConfig - Request headers and fetch options
 * @returns Request response
 */
export async function makeRequest<TBody = undefined, TResponse = unknown>(
  url: string,
  method: Methods = Methods.GET,
  body?: TBody,
  requestConfig?: RequestConfig,
): Promise<HttpResponse<TResponse>> {
  const normalizedConfig = toRequestOptions(requestConfig);
  const headers: HeadersInit = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...toHeaderRecord(normalizedConfig.headers),
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      ...(normalizedConfig.credentials
        ? { credentials: normalizedConfig.credentials }
        : {}),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const rawText = await response.text();

    let parsed: unknown = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const parsedMessage = getObjectValue(parsed, "message");
      const parsedError = getObjectValue(parsed, "error");
      const message =
        typeof parsedMessage === "string" && parsedMessage.length
          ? parsedMessage
          : typeof parsedError === "string" && parsedError.length
            ? parsedError
            : rawText || response.statusText;

      return {
        data: null,
        status: response.status,
        error: {
          status: response.status,
          message: message || "Unknown error occurred",
        },
      };
    }

    return {
      data:
        response.status !== 204 && parsed !== null
          ? (parsed as TResponse)
          : null,
      status: response.status,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      status: 500,
      error: {
        status: 500,
        message: err instanceof Error ? err.message : "Unknown error occurred",
      },
    };
  }
}

/**
 * Builds a URL with query-string parameters from a filter object.
 * @param endpoint - Base endpoint path.
 * @param params - Filter/query params object.
 * @returns Endpoint with encoded query string.
 */
export function buildQueryUrl<TFilter>(
  endpoint: string,
  params?: TFilter,
): string {
  const toQueryValue = (value: unknown) => {
    if (value instanceof Date) return value.toISOString();
    return String(value);
  };

  if (params) {
    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(toQueryValue(value))}`,
      )
      .join("&");

    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }
  return endpoint;
}
