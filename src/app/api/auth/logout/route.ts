import { logoutHandler } from "@/server/auth/presentation/route-handlers/logout.handler";

export function POST() {
  return logoutHandler();
}
