import type { HttpClient } from "@/shared/interfaces/http-client";
import { HttpError } from "./http-error";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseUrl: string = "") {}

  async get<T>(params: {
    path: string;
    queryParams?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>("GET", params.path, undefined, params.headers, params.queryParams);
  }

  async post<T>(params: {
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>("POST", params.path, params.body, params.headers);
  }

  async put<T>(params: {
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>("PUT", params.path, params.body, params.headers);
  }

  async delete<T>(params: {
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>("DELETE", params.path, params.body, params.headers);
  }

  private buildUrl(path: string, queryParams?: Record<string, unknown>): string {
    const base = `${this.baseUrl}${path}`;
    if (!queryParams) return base;
    const url = new URL(base, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)));
      } else {
        url.searchParams.append(key, String(value));
      }
    });
    return this.baseUrl ? url.toString() : `${url.pathname}${url.search}`;
  }

  private async request<T>(
    method: Method,
    path: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>,
    queryParams?: Record<string, unknown>
  ): Promise<T> {
    const url = this.buildUrl(path, queryParams);
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...(headers ?? {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
      // Ensures the httpOnly session cookie set by the backend is sent on subsequent requests.
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      let parsed: unknown;
      try {
        parsed = text ? JSON.parse(text) : undefined;
      } catch {
        throw new HttpError(response.status, text || response.statusText);
      }
      const message =
        (parsed && typeof parsed === "object" && "error" in parsed && typeof (parsed as { error: unknown }).error === "string"
          ? (parsed as { error: string }).error
          : response.statusText) || "Request failed";
      throw new HttpError(response.status, message, parsed);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }
}
