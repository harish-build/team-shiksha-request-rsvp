import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { DeleteProjectUseCaseFactory } from "../../application/use-cases/delete-project/delete-project.factory";
import { makeDeleteProjectHandler } from "./delete-project.handler";

export const deleteProjectHandler = makeDeleteProjectHandler(
  new DeleteProjectUseCaseFactory(),
  new JwtSessionManager<SessionData>()
);
