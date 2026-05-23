export interface BaseSessionPayload {
  iat?: number;
  exp?: number;
}

export interface SessionManager<T extends BaseSessionPayload = BaseSessionPayload> {
  createSession(payload: Omit<T, "iat" | "exp">): Promise<string>;
  validateSession(token: string): Promise<T | null>;
}
