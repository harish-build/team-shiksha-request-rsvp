export class NotFoundError extends Error {
  readonly code: string;

  constructor(message: string = "Not found", code: string = "NOT_FOUND") {
    super(message);
    this.name = "NotFoundError";
    this.code = code;
  }
}
