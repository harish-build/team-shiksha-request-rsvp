import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/interfaces/repositories/project.repository";
import { GetProjectByIdUseCase } from "../../application/use-cases/get-project-by-id/get-project-by-id.use-case";
import { GetProjectByIdUseCaseFactory } from "../../application/use-cases/get-project-by-id/get-project-by-id.factory";
import { makeGetProjectByIdHandler } from "./get-project-by-id.handler";

describe("get project by id route handler", () => {
  let sessionManager: JwtSessionManager<SessionData>;
  let factory: GetProjectByIdUseCaseFactory;
  let stubProject: Project | null;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRY = "1h";
  });

  beforeEach(() => {
    sessionManager = new JwtSessionManager<SessionData>();
    stubProject = null;
    const repository: ProjectRepository = {
      findAll: async () => [],
      findByOrgId: async () => [],
      findByIds: async () => [],
      findById: async () => stubProject,
      create: async () => stubProject as Project,
    };
    factory = {
      create: () => new GetProjectByIdUseCase(repository),
    } as unknown as GetProjectByIdUseCaseFactory;
  });

  async function makeRequestWithSession(
    payload: Omit<SessionData, "iat" | "exp"> | null,
    projectId: string
  ): Promise<NextRequest> {
    const req = new NextRequest(`http://localhost/api/projects/${projectId}`, { method: "GET" });
    if (payload) {
      const token = await sessionManager.createSession(payload);
      req.cookies.set(SESSION_COOKIE_NAME, token);
    }
    return req;
  }

  it("returns 200 with the project when actor can see it", async () => {
    stubProject = { id: "proj-1", name: "Alpha", orgId: "org-a" };
    const handler = makeGetProjectByIdHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      {
        userId: "user-1",
        email: "admin@demo.test",
        role: "ADMIN",
        orgId: "org-a",
        projectMembershipIds: [],
      },
      "proj-1"
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ project: stubProject });
  });

  it("returns 404 when actor cannot see it", async () => {
    stubProject = { id: "proj-9", name: "Zeta", orgId: "org-b" };
    const handler = makeGetProjectByIdHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      {
        userId: "user-1",
        email: "admin@demo.test",
        role: "ADMIN",
        orgId: "org-a",
        projectMembershipIds: [],
      },
      "proj-9"
    );

    const response = await handler(request, { id: "proj-9" });

    expect(response.status).toBe(404);
  });

  it("returns 401 when the session cookie is missing", async () => {
    const handler = makeGetProjectByIdHandler(factory, sessionManager);
    const request = await makeRequestWithSession(null, "proj-1");

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(401);
  });
});
