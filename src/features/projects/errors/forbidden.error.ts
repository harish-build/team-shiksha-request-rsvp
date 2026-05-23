export class ForbiddenError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor(message: string = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}
