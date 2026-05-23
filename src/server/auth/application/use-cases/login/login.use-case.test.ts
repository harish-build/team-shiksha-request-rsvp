import bcrypt from "bcryptjs";
import { ValidationError } from "@/server/shared/domain/errors";
import type {
  UserRepository,
  UserWithMemberships,
} from "../../../domain/interfaces/repositories/user.repository";
import { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials.error";
import { LoginUseCase } from "./login.use-case";

describe("LoginUseCase", () => {
  let userRepository: jest.Mocked<UserRepository>;
  let useCase: LoginUseCase;

  const validPassword = "demo1234";
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(validPassword, 10);
  });

  beforeEach(() => {
    userRepository = { findByEmailWithMemberships: jest.fn() };
    useCase = new LoginUseCase(userRepository);
  });

  function aMember(overrides: Partial<UserWithMemberships> = {}): UserWithMemberships {
    return {
      id: "user-1",
      email: "member@demo.test",
      passwordHash,
      role: "MEMBER",
      orgId: "org-a",
      projectMembershipIds: ["proj-1", "proj-2"],
      ...overrides,
    };
  }

  it("returns the actor when credentials are valid", async () => {
    userRepository.findByEmailWithMemberships.mockResolvedValue(aMember());

    const result = await useCase.execute({ email: "member@demo.test", password: validPassword });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual({
      userId: "user-1",
      email: "member@demo.test",
      role: "MEMBER",
      orgId: "org-a",
      projectMembershipIds: ["proj-1", "proj-2"],
    });
  });

  it("fails with InvalidCredentialsError when the email is not registered", async () => {
    userRepository.findByEmailWithMemberships.mockResolvedValue(null);

    const result = await useCase.execute({ email: "ghost@demo.test", password: validPassword });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(InvalidCredentialsError);
  });

  it("fails with InvalidCredentialsError when the password is wrong", async () => {
    userRepository.findByEmailWithMemberships.mockResolvedValue(aMember());

    const result = await useCase.execute({
      email: "member@demo.test",
      password: "wrong-password",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(InvalidCredentialsError);
  });

  it("fails with ValidationError when the email is missing", async () => {
    const result = await useCase.execute({ email: "", password: validPassword });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(userRepository.findByEmailWithMemberships).not.toHaveBeenCalled();
  });

  it("fails with ValidationError when the password is missing", async () => {
    const result = await useCase.execute({ email: "member@demo.test", password: "" });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(userRepository.findByEmailWithMemberships).not.toHaveBeenCalled();
  });

  it("normalises email casing before lookup so case differences still match", async () => {
    userRepository.findByEmailWithMemberships.mockResolvedValue(aMember());

    await useCase.execute({ email: "MEMBER@Demo.Test", password: validPassword });

    expect(userRepository.findByEmailWithMemberships).toHaveBeenCalledWith("member@demo.test");
  });
});
