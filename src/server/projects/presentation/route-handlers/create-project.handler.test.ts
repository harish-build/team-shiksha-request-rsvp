import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { RoleGuardDecorator } from "@/server/shared/decorators/role-guard.decorator";
import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/interfaces/repositories/project.repository";
import { CreateProjectUseCase } from "../../application/use-cases/create-project/create-project.use-case";
import type { CreateProjectUseCaseFactory } from "../../application/use-cases/create-project/create-project.factory";
import type {
  CreateProjectRequest,
  CreateProjectResponseData,
} from "../../application/use-cases/create-project/create-project.types";
import { makeCreateProjectHandler } from "./create-project.handler";

describe("create project route handler", () => {
  let sessionManager: JwtSessionManager<SessionData>;
  let factory: CreateProjectUseCaseFactory;
  let repository: ProjectRepository;
  let createSpy: jest.Mock;
  let innerExecuteSpy: jest.SpyInstance | null;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRY = "1h";
  });

  beforeEach(() => {
    sessionManager = new JwtSessionManager<SessionData>();
    createSpy = jest.fn(async (input: { name: string; orgId: string }) => ({
      id: "proj-new",
      name: input.name,
      orgId: input.orgId,
    }));
    repository = {
      findAll: async () => [],
      findByOrgId: async () => [],
      findByIds: async () => [],
      findById: async () => null,
      create: createSpy as unknown as ProjectRepository["create"],
      update: async () => ({ id: "proj-new", name: "", orgId: "" }),
      delete: async () => {},
    };
    const innerUseCase = new CreateProjectUseCase(repository);
    innerExecuteSpy = jest.spyOn(innerUseCase, "execute");
    factory = {
      create: () =>
        new RoleGuardDecorator<CreateProjectRequest, CreateProjectResponseData>(
          ["SUPERADMIN", "ADMIN"] as const,
          innerUseCase
        ),
    } as unknown as CreateProjectUseCaseFactory;
  });

  async function makeRequestWithSession(
    payload: Omit<SessionData, "iat" | "exp"> | null,
    body: unknown
  ): Promise<NextRequest> {
    const req = new NextRequest("http://localhost/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (payload) {
      const token = await sessionManager.createSession(payload);
      req.cookies.set(SESSION_COOKIE_NAME, token);
    }
    return req;
  }

  it("returns 201 with the project when ADMIN creates in their own org", async () => {
    const handler = makeCreateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      {
        userId: "user-1",
        email: "admin@demo.test",
        role: "ADMIN",
        orgId: "org-a",
        projectMembershipIds: [],
      },
      { name: "Alpha", orgId: "org-a" }
    );

    const response = await handler(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      project: { id: "proj-new", name: "Alpha", orgId: "org-a" },
    });
  });

  it("returns 403 when ADMIN creates in another org", async () => {
    const handler = makeCreateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      {
        userId: "user-1",
        email: "admin@demo.test",
        role: "ADMIN",
        orgId: "org-a",
        projectMembershipIds: [],
      },
      { name: "Cross", orgId: "org-b" }
    );

    const response = await handler(request);

    expect(response.status).toBe(403);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("returns 403 when actor is MEMBER (caught by RoleGuard)", async () => {
    const handler = makeCreateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      {
        userId: "user-1",
        email: "member@demo.test",
        role: "MEMBER",
        orgId: "org-a",
        projectMembershipIds: [],
      },
      { name: "Blocked", orgId: "org-a" }
    );

    const response = await handler(request);

    expect(response.status).toBe(403);
    expect(innerExecuteSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("returns 400 when name is empty", async () => {
    const handler = makeCreateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(
      {
        userId: "user-1",
        email: "admin@demo.test",
        role: "ADMIN",
        orgId: "org-a",
        projectMembershipIds: [],
      },
      { name: "", orgId: "org-a" }
    );

    const response = await handler(request);

    expect(response.status).toBe(400);
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("returns 401 when cookie is missing", async () => {
    const handler = makeCreateProjectHandler(factory, sessionManager);
    const request = await makeRequestWithSession(null, { name: "Alpha", orgId: "org-a" });

    const response = await handler(request);

    expect(response.status).toBe(401);
  });
});
