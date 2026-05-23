import bcrypt from "bcryptjs";
import { z } from "zod";
import { ValidationError } from "@/server/shared/domain/errors";
import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { Actor } from "../../../domain/entities/actor";
import { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials.error";
import type { UserRepository } from "../../../domain/interfaces/repositories/user.repository";
import type { LoginRequest, LoginResponse } from "./login.types";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export class LoginUseCase implements UseCase<LoginRequest, LoginResponse> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const parsed = loginSchema.safeParse(request);
    if (!parsed.success) {
      return Result.fail(new ValidationError(parsed.error.issues[0].message));
    }

    const email = parsed.data.email.toLowerCase();
    const user = await this.userRepository.findByEmailWithMemberships(email);
    if (!user) {
      return Result.fail(new InvalidCredentialsError());
    }

    const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
      return Result.fail(new InvalidCredentialsError());
    }

    const actor: Actor = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      projectMembershipIds: user.projectMembershipIds,
    };
    return Result.ok(actor);
  }
}
