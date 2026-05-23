import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import { makeMeHandler } from "./me.handler";

export const meHandler = makeMeHandler(new JwtSessionManager<SessionData>());
