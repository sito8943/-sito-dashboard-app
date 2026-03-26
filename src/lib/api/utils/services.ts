// types
import { HttpResponse } from "./types";

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
      const message =
        typeof parsed === "object" && parsed !== null
          ? ((parsed as any).message ?? (parsed as any).error ?? rawText)
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
