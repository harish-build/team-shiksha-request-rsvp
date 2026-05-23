import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { ListOrganizationsUseCaseFactory } from "../../application/use-cases/list-organizations/list-organizations.factory";
import { makeListOrganizationsHandler } from "./list-organizations.handler";

export const listOrganizationsHandler = makeListOrganizationsHandler(
  new ListOrganizationsUseCaseFactory(),
  new JwtSessionManager<SessionData>()
);
