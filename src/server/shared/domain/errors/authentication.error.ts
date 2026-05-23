export class AuthenticationError extends Error {
  readonly code: string;

  constructor(
    message: string = "Authentication failed",
    code: string = "AUTHENTICATION_FAILED"
  ) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
  }
}
