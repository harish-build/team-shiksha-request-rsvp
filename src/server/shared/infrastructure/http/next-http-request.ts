import type { NextRequest } from "next/server";

export class NextHttpRequest {
  constructor(
    public readonly cookies: Record<string, string>,
    public readonly params: Record<string, string>,
    public readonly query: Record<string, string>,
    public readonly body: unknown
  ) {}

  static async fromNextRequest(
    req: NextRequest,
    params: Record<string, string> = {}
  ): Promise<NextHttpRequest> {
    const cookies: Record<string, string> = {};
    for (const cookie of req.cookies.getAll()) {
      cookies[cookie.name] = cookie.value;
    }

    const query: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const body = await NextHttpRequest.parseBody(req);

    return new NextHttpRequest(cookies, params, query, body);
  }

  private static async parseBody(req: NextRequest): Promise<unknown> {
    if (req.method === "GET" || req.method === "HEAD") {
      return null;
    }
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return null;
    }
    try {
      return await req.json();
    } catch {
      return null;
    }
  }
}
