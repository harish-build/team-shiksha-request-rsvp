import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { UpdateProjectUseCaseFactory } from "../../application/use-cases/update-project/update-project.factory";
import { makeUpdateProjectHandler } from "./update-project.handler";

export const updateProjectHandler = makeUpdateProjectHandler(
  new UpdateProjectUseCaseFactory(),
  new JwtSessionManager<SessionData>()
);
