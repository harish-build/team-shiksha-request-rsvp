export class NotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor(message: string = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}
