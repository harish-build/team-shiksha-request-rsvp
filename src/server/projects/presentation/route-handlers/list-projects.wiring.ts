import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { ListProjectsUseCaseFactory } from "../../application/use-cases/list-projects/list-projects.factory";
import { makeListProjectsHandler } from "./list-projects.handler";

export const listProjectsHandler = makeListProjectsHandler(
  new ListProjectsUseCaseFactory(),
  new JwtSessionManager<SessionData>()
);
