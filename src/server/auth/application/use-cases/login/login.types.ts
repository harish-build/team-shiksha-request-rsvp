import type { Result } from "@/server/shared/domain/result";
import type { ValidationError } from "@/server/shared/domain/errors";
import type { Actor } from "../../../domain/entities/actor";
import type { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials.error";

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = Result<Actor, ValidationError | InvalidCredentialsError>;
