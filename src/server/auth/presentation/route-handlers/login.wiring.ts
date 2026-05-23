import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { LoginUseCaseFactory } from "../../application/use-cases/login/login.factory";
import { makeLoginHandler } from "./login.handler";

export const loginHandler = makeLoginHandler(
  new LoginUseCaseFactory(),
  new JwtSessionManager<SessionData>()
);
