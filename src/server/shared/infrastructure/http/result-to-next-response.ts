import { NextResponse } from "next/server";
import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../domain/errors";
import type { Result } from "../../domain/result";

export interface ResponseOptions {
  successStatus?: number;
  setCookie?: { name: string; value: string; maxAgeSeconds: number };
  clearCookie?: string;
}

export function resultToNextResponse<T>(
  result: Result<T, Error>,
  options: ResponseOptions = {}
): NextResponse {
  if (result.isSuccess) {
    const response = NextResponse.json(result.getValue(), {
      status: options.successStatus ?? 200,
    });
    applyCookies(response, options);
    return response;
  }

  const err = result.error();
  const body = { error: err.message };

  if (err instanceof AuthenticationError) return NextResponse.json(body, { status: 401 });
  if (err instanceof ForbiddenError) return NextResponse.json(body, { status: 403 });
  if (err instanceof NotFoundError) return NextResponse.json(body, { status: 404 });
  if (err instanceof ValidationError) return NextResponse.json(body, { status: 400 });
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function applyCookies(response: NextResponse, options: ResponseOptions): void {
  if (options.setCookie) {
    response.cookies.set({
      name: options.setCookie.name,
      value: options.setCookie.value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: options.setCookie.maxAgeSeconds,
    });
  }
  if (options.clearCookie) {
    response.cookies.set({
      name: options.clearCookie,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
}
