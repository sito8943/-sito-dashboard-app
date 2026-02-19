// types
import { HttpResponse } from "./types";

export enum Methods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

/**
 * @description Make a request to the API
 * @param url - URL to make the request
 * @param method - Request method
 * @param body - Request body
 * @param h - Request headers
 * @returns Request response
 */
export async function makeRequest<TBody = undefined, TResponse = unknown>(
  url: string,
  method: Methods = Methods.GET,
  body?: TBody,
  customHeaders?: HeadersInit
): Promise<HttpResponse<TResponse>> {
  const headers: HeadersInit = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...customHeaders,
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
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
  params?: TFilter
): string {
  if (params) {
    const queryString = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join("&");

    return queryString ? `${endpoint}?${queryString}` : endpoint;
  }
  return endpoint;
}
