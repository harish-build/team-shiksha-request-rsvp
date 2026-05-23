export interface HttpClient {
  get<T>(params: {
    path: string;
    queryParams?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T>;
  post<T>(params: {
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T>;
  put<T>(params: {
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T>;
  delete<T>(params: {
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
  }): Promise<T>;
}
