import { listProjectsHandler } from "@/server/projects/presentation/route-handlers/list-projects.wiring";
import { createProjectHandler } from "@/server/projects/presentation/route-handlers/create-project.wiring";

export const GET = listProjectsHandler;
export const POST = createProjectHandler;
