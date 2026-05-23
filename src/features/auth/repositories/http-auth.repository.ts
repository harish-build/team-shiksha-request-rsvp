import type { HttpClient } from "@/shared/interfaces/http-client";
import { HttpError } from "@/shared/services/http-error";
import type { AuthRepository, LoginCredentials } from "../interfaces/auth.repository";
import type { Actor } from "../types/actor";
import { InvalidCredentialsError } from "../errors/invalid-credentials.error";
import { ValidationError } from "../errors/validation.error";

interface LoginResponseBody {
  actor: Actor;
}

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async login(credentials: LoginCredentials): Promise<Actor> {
    try {
      const response = await this.httpClient.post<LoginResponseBody>({
        path: "/api/auth/login",
        body: { email: credentials.email, password: credentials.password },
      });
      return response.actor;
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 401) throw new InvalidCredentialsError();
        if (error.status === 400) throw new ValidationError(error.message);
      }
      throw error;
    }
  }
}
