import { RoleGuardDecorator } from "@/server/shared/decorators/role-guard.decorator";
import type { UseCase } from "@/server/shared/domain/use-case";
import { PrismaProjectRepository } from "../../../infrastructure/repositories/prisma-project.repository";
import { CreateProjectUseCase } from "./create-project.use-case";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
} from "./create-project.types";

export class CreateProjectUseCaseFactory {
  create(): UseCase<CreateProjectRequest, CreateProjectResponse> {
    const projectRepository = new PrismaProjectRepository();
    const inner = new CreateProjectUseCase(projectRepository);
    return new RoleGuardDecorator(["SUPERADMIN", "ADMIN"] as const, inner);
  }
}
