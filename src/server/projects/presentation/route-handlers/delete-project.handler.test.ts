import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { RoleGuardDecorator } from "@/server/shared/decorators/role-guard.decorator";
import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/interfaces/repositories/project.repository";
import { DeleteProjectUseCase } from "../../application/use-cases/delete-project/delete-project.use-case";
import type { DeleteProjectUseCaseFactory } from "../../application/use-cases/delete-project/delete-project.factory";
import type {
  DeleteProjectRequest,
  DeleteProjectResponseData,
} from "../../application/use-cases/delete-project/delete-project.types";
import { makeDeleteProjectHandler } from "./delete-project.handler";

describe("delete project route handler", () => {
  let sessionManager: JwtSessionManager<SessionData>;
  let factory: DeleteProjectUseCaseFactory;
  let stubProject: Project | null;
  let deleteSpy: jest.Mock;
  let innerExecuteSpy: jest.SpyInstance;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRY = "1h";
  });

  beforeEach(() => {
    sessionManager = new JwtSessionManager<SessionData>();
    stubProject = null;
    deleteSpy = jest.fn(async () => {});
    const repository: ProjectRepository = {
      findAll: async () => [],
      findByOrgId: async () => [],
      findByIds: async () => [],
      findById: async () => stubProject,
      create: async () => stubProject as Project,
      update: async () => stubProject as Project,
      delete: deleteSpy as unknown as ProjectRepository["delete"],
    };
    const innerUseCase = new DeleteProjectUseCase(repository);
    innerExecuteSpy = jest.spyOn(innerUseCase, "execute");
    factory = {
      create: () =>
        new RoleGuardDecorator<DeleteProjectRequest, DeleteProjectResponseData>(
          ["SUPERADMIN", "ADMIN"] as const,
          innerUseCase
        ),
    } as unknown as DeleteProjectUseCaseFactory;
  });

  async function makeRequestWithSession(
    payload: Omit<SessionData, "iat" | "exp"> | null,
    projectId: string
  ): Promise<NextRequest> {
    const req = new NextRequest(`http://localhost/api/projects/${projectId}`, { method: "DELETE" });
    if (payload) {
      const token = await sessionManager.createSession(payload);
      req.cookies.set(SESSION_COOKIE_NAME, token);
    }
    return req;
  }

  it("returns 204 when ADMIN deletes their own", async () => {
    stubProject = { id: "proj-1", name: "Alpha", orgId: "org-a" };
    const handler = makeDeleteProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      { userId: "u", email: "a@d.test", role: "ADMIN", orgId: "org-a", projectMembershipIds: [] },
      "proj-1"
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(204);
    expect(deleteSpy).toHaveBeenCalledWith("proj-1");
  });

  it("returns 404 when ADMIN deletes a different org's project", async () => {
    stubProject = { id: "proj-1", name: "Alpha", orgId: "org-b" };
    const handler = makeDeleteProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      { userId: "u", email: "a@d.test", role: "ADMIN", orgId: "org-a", projectMembershipIds: [] },
      "proj-1"
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(404);
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns 403 when MEMBER attempts delete", async () => {
    stubProject = { id: "proj-1", name: "Alpha", orgId: "org-a" };
    const handler = makeDeleteProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      { userId: "u", email: "m@d.test", role: "MEMBER", orgId: "org-a", projectMembershipIds: ["proj-1"] },
      "proj-1"
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(403);
    expect(innerExecuteSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns 401 when cookie is missing", async () => {
    const handler = makeDeleteProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(null, "proj-1");

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(401);
  });
});
