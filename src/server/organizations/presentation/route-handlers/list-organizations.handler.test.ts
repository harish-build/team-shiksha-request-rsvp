import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { Organization } from "../../domain/entities/organization";
import type { OrganizationRepository } from "../../domain/interfaces/repositories/organization.repository";
import { ListOrganizationsUseCase } from "../../application/use-cases/list-organizations/list-organizations.use-case";
import { ListOrganizationsUseCaseFactory } from "../../application/use-cases/list-organizations/list-organizations.factory";
import { makeListOrganizationsHandler } from "./list-organizations.handler";

describe("list organizations route handler", () => {
  let sessionManager: JwtSessionManager<SessionData>;
  let factory: ListOrganizationsUseCaseFactory;
  let stubOrganizations: Organization[];

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRY = "1h";
  });

  beforeEach(() => {
    sessionManager = new JwtSessionManager<SessionData>();
    stubOrganizations = [];
    const repository: OrganizationRepository = {
      findAll: async () => stubOrganizations,
      findById: async () => stubOrganizations[0] ?? null,
    };
    factory = {
      create: () => new ListOrganizationsUseCase(repository),
    } as unknown as ListOrganizationsUseCaseFactory;
  });

  async function makeRequestWithSession(
    payload: Omit<SessionData, "iat" | "exp"> | null
  ): Promise<NextRequest> {
    const req = new NextRequest("http://localhost/api/organizations", { method: "GET" });
    if (payload) {
      const token = await sessionManager.createSession(payload);
      req.cookies.set(SESSION_COOKIE_NAME, token);
    }
    return req;
  }

  it("returns 200 with organizations when the session cookie is valid", async () => {
    stubOrganizations = [
      { id: "org-a", name: "Org A" },
      { id: "org-b", name: "Org B" },
    ];
    const handler = makeListOrganizationsHandler(factory, sessionManager);
    const request = await makeRequestWithSession({
      userId: "user-1",
      email: "super@demo.test",
      role: "SUPERADMIN",
      orgId: null,
      projectMembershipIds: [],
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ organizations: stubOrganizations });
  });

  it("returns 401 when the session cookie is missing", async () => {
    const handler = makeListOrganizationsHandler(factory, sessionManager);
    const request = await makeRequestWithSession(null);

    const response = await handler(request);

    expect(response.status).toBe(401);
  });
});
