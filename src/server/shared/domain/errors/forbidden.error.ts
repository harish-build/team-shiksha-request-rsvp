export class ForbiddenError extends Error {
  readonly code: string;

  constructor(message: string = "Forbidden", code: string = "FORBIDDEN") {
    super(message);
    this.name = "ForbiddenError";
    this.code = code;
  }
}
