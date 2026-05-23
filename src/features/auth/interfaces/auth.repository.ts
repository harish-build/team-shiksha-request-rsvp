import type { Actor } from "../types/actor";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<Actor>;
  getMe(): Promise<Actor | null>;
}
