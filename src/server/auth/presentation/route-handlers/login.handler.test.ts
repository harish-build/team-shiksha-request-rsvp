import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/shared/decorators/authenticate.decorator";
import { JwtSessionManager } from "@/server/shared/infrastructure/jwt-session-manager.service";
import type { SessionData } from "@/server/shared/infrastructure/session-data";
import type { UserWithMemberships } from "../../domain/interfaces/repositories/user.repository";
import { LoginUseCase } from "../../application/use-cases/login/login.use-case";
import { LoginUseCaseFactory } from "../../application/use-cases/login/login.factory";
import { makeLoginHandler } from "./login.handler";
import bcrypt from "bcryptjs";

describe("login route handler", () => {
  const validPassword = "demo1234";
  let passwordHash: string;
  let sessionManager: JwtSessionManager<SessionData>;
  let factory: LoginUseCaseFactory;
  let stubUser: UserWithMemberships | null;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRY = "1h";
    passwordHash = await bcrypt.hash(validPassword, 10);
  });

  beforeEach(() => {
    sessionManager = new JwtSessionManager<SessionData>();
    stubUser = null;
    factory = {
      create: () =>
        new LoginUseCase({
          findByEmailWithMemberships: async () => stubUser,
        }),
    } as unknown as LoginUseCaseFactory;
  });

  function makeRequest(body: unknown): NextRequest {
    return new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("returns 200 with the actor and sets a session cookie when credentials are valid", async () => {
    stubUser = {
      id: "user-1",
      email: "member@demo.test",
      passwordHash,
      role: "MEMBER",
      orgId: "org-a",
      projectMembershipIds: ["proj-1"],
    };
    const handler = makeLoginHandler(factory, sessionManager);

    const response = await handler(makeRequest({ email: "member@demo.test", password: validPassword }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      actor: {
        userId: "user-1",
        email: "member@demo.test",
        role: "MEMBER",
        orgId: "org-a",
        projectMembershipIds: ["proj-1"],
      },
    });
    const cookie = response.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie!.value.length).toBeGreaterThan(0);
    expect(cookie!.httpOnly).toBe(true);
  });

  it("returns 401 with no cookie when credentials are invalid", async () => {
    stubUser = null;
    const handler = makeLoginHandler(factory, sessionManager);

    const response = await handler(makeRequest({ email: "ghost@demo.test", password: validPassword }));

    expect(response.status).toBe(401);
    expect(response.cookies.get(SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it("returns 400 when required fields are missing", async () => {
    const handler = makeLoginHandler(factory, sessionManager);

    const response = await handler(makeRequest({ email: "" }));

    expect(response.status).toBe(400);
    expect(response.cookies.get(SESSION_COOKIE_NAME)).toBeUndefined();
  });
});
