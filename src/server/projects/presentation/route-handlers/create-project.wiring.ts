import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { CreateProjectUseCaseFactory } from "../../application/use-cases/create-project/create-project.factory";
import { makeCreateProjectHandler } from "./create-project.handler";

export const createProjectHandler = makeCreateProjectHandler(
  new CreateProjectUseCaseFactory(),
  new JwtSessionManager<SessionData>()
);
