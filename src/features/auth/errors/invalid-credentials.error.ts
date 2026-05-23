export class InvalidCredentialsError extends Error {
  constructor(message: string = "Invalid email or password") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}
