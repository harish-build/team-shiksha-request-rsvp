import type { NextRequest } from "next/server";
import { getProjectByIdHandler } from "@/server/projects/presentation/route-handlers/get-project-by-id.wiring";
import { updateProjectHandler } from "@/server/projects/presentation/route-handlers/update-project.wiring";
import { deleteProjectHandler } from "@/server/projects/presentation/route-handlers/delete-project.wiring";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  return getProjectByIdHandler(req, { id });
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  return updateProjectHandler(req, { id });
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  return deleteProjectHandler(req, { id });
}
