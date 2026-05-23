import type { NextRequest } from "next/server";
import { getProjectByIdHandler } from "@/server/projects/presentation/route-handlers/get-project-by-id.wiring";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  return getProjectByIdHandler(req, { id });
}
