import { AuthenticationError } from "@/server/shared/domain/errors";

export class InvalidCredentialsError extends AuthenticationError {
  constructor() {
    super("Invalid email or password", "INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}
