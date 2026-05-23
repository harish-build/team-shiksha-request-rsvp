import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { GetProjectByIdUseCaseFactory } from "../../application/use-cases/get-project-by-id/get-project-by-id.factory";
import { makeGetProjectByIdHandler } from "./get-project-by-id.handler";

export const getProjectByIdHandler = makeGetProjectByIdHandler(
  new GetProjectByIdUseCaseFactory(),
  new JwtSessionManager<SessionData>()
);
