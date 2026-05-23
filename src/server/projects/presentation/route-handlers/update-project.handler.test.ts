import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { RoleGuardDecorator } from "@/server/shared/decorators/role-guard.decorator";
import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/interfaces/repositories/project.repository";
import { UpdateProjectUseCase } from "../../application/use-cases/update-project/update-project.use-case";
import type { UpdateProjectUseCaseFactory } from "../../application/use-cases/update-project/update-project.factory";
import type {
  UpdateProjectRequest,
  UpdateProjectResponseData,
} from "../../application/use-cases/update-project/update-project.types";
import { makeUpdateProjectHandler } from "./update-project.handler";

describe("update project route handler", () => {
  let sessionManager: JwtSessionManager<SessionData>;
  let factory: UpdateProjectUseCaseFactory;
  let stubProject: Project | null;
  let updateSpy: jest.Mock;
  let innerExecuteSpy: jest.SpyInstance;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRY = "1h";
  });

  beforeEach(() => {
    sessionManager = new JwtSessionManager<SessionData>();
    stubProject = null;
    updateSpy = jest.fn(async (id: string, patch: { name: string }) => ({
      id,
      name: patch.name,
      orgId: stubProject?.orgId ?? "org-a",
    }));
    const repository: ProjectRepository = {
      findAll: async () => [],
      findByOrgId: async () => [],
      findByIds: async () => [],
      findById: async () => stubProject,
      create: async () => stubProject as Project,
      update: updateSpy as unknown as ProjectRepository["update"],
      delete: async () => {},
    };
    const innerUseCase = new UpdateProjectUseCase(repository);
    innerExecuteSpy = jest.spyOn(innerUseCase, "execute");
    factory = {
      create: () =>
        new RoleGuardDecorator<UpdateProjectRequest, UpdateProjectResponseData>(
          ["SUPERADMIN", "ADMIN"] as const,
          innerUseCase
        ),
    } as unknown as UpdateProjectUseCaseFactory;
  });

  async function makeRequestWithSession(
    payload: Omit<SessionData, "iat" | "exp"> | null,
    projectId: string,
    body: unknown
  ): Promise<NextRequest> {
    const req = new NextRequest(`http://localhost/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (payload) {
      const token = await sessionManager.createSession(payload);
      req.cookies.set(SESSION_COOKIE_NAME, token);
    }
    return req;
  }

  it("returns 200 with the updated project when ADMIN updates their own", async () => {
    stubProject = { id: "proj-1", name: "Old", orgId: "org-a" };
    const handler = makeUpdateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      { userId: "u", email: "a@d.test", role: "ADMIN", orgId: "org-a", projectMembershipIds: [] },
      "proj-1",
      { name: "Renamed" }
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      project: { id: "proj-1", name: "Renamed", orgId: "org-a" },
    });
  });

  it("returns 404 when ADMIN updates a different org's project", async () => {
    stubProject = { id: "proj-1", name: "Old", orgId: "org-b" };
    const handler = makeUpdateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      { userId: "u", email: "a@d.test", role: "ADMIN", orgId: "org-a", projectMembershipIds: [] },
      "proj-1",
      { name: "Renamed" }
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(404);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("returns 403 when MEMBER attempts update (RoleGuard short-circuits, inner not called)", async () => {
    stubProject = { id: "proj-1", name: "Old", orgId: "org-a" };
    const handler = makeUpdateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      { userId: "u", email: "m@d.test", role: "MEMBER", orgId: "org-a", projectMembershipIds: ["proj-1"] },
      "proj-1",
      { name: "Renamed" }
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(403);
    expect(innerExecuteSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("returns 400 when name is empty", async () => {
    stubProject = { id: "proj-1", name: "Old", orgId: "org-a" };
    const handler = makeUpdateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      { userId: "u", email: "a@d.test", role: "ADMIN", orgId: "org-a", projectMembershipIds: [] },
      "proj-1",
      { name: "" }
    );

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(400);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("returns 401 when cookie is missing", async () => {
    const handler = makeUpdateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(null, "proj-1", { name: "Renamed" });

    const response = await handler(request, { id: "proj-1" });

    expect(response.status).toBe(401);
  });
});
