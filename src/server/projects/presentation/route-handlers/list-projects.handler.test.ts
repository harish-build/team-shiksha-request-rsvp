import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/interfaces/repositories/project.repository";
import { ListProjectsUseCase } from "../../application/use-cases/list-projects/list-projects.use-case";
import { ListProjectsUseCaseFactory } from "../../application/use-cases/list-projects/list-projects.factory";
import { makeListProjectsHandler } from "./list-projects.handler";

describe("list projects route handler", () => {
  let sessionManager: JwtSessionManager<SessionData>;
  let factory: ListProjectsUseCaseFactory;
  let stubProjects: Project[];

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRY = "1h";
  });

  beforeEach(() => {
    sessionManager = new JwtSessionManager<SessionData>();
    stubProjects = [];
    const repository: ProjectRepository = {
      findAll: async () => stubProjects,
      findByOrgId: async () => stubProjects,
      findByIds: async () => stubProjects,
      findById: async () => stubProjects[0] ?? null,
    };
    factory = {
      create: () => new ListProjectsUseCase(repository),
    } as unknown as ListProjectsUseCaseFactory;
  });

  async function makeRequestWithSession(payload: Omit<SessionData, "iat" | "exp"> | null): Promise<NextRequest> {
    const req = new NextRequest("http://localhost/api/projects", { method: "GET" });
    if (payload) {
      const token = await sessionManager.createSession(payload);
      req.cookies.set(SESSION_COOKIE_NAME, token);
    }
    return req;
  }

  it("returns 200 with the projects when the session cookie is valid", async () => {
    stubProjects = [
      { id: "proj-1", name: "Alpha", orgId: "org-a" },
      { id: "proj-2", name: "Beta", orgId: "org-a" },
    ];
    const handler = makeListProjectsHandler(factory, sessionManager);
    const request = await makeRequestWithSession({
      userId: "user-1",
      email: "admin@demo.test",
      role: "ADMIN",
      orgId: "org-a",
      projectMembershipIds: [],
    });

    const response = await handler(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ projects: stubProjects });
  });

  it("returns 401 when the session cookie is missing", async () => {
    const handler = makeListProjectsHandler(factory, sessionManager);
    const request = await makeRequestWithSession(null);

    const response = await handler(request);

    expect(response.status).toBe(401);
  });
});
