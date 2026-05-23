import { NextResponse } from "next/server";
import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../domain/errors";
import type { Result } from "../../domain/result";

export function resultToNextResponse<T>(
  result: Result<T, Error>,
  successStatus: number = 200
): NextResponse {
  if (result.isSuccess) {
    return NextResponse.json(result.getValue(), { status: successStatus });
  }

  const err = result.error();
  const body = { error: err.message };

  if (err instanceof AuthenticationError) return NextResponse.json(body, { status: 401 });
  if (err instanceof ForbiddenError) return NextResponse.json(body, { status: 403 });
  if (err instanceof NotFoundError) return NextResponse.json(body, { status: 404 });
  if (err instanceof ValidationError) return NextResponse.json(body, { status: 400 });
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
