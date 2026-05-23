import { RoleGuardDecorator } from "@/server/shared/decorators/role-guard.decorator";
import type { UseCase } from "@/server/shared/domain/use-case";
import { PrismaProjectRepository } from "../../../infrastructure/repositories/prisma-project.repository";
import { UpdateProjectUseCase } from "./update-project.use-case";
import type {
  UpdateProjectRequest,
  UpdateProjectResponse,
} from "./update-project.types";

export class UpdateProjectUseCaseFactory {
  create(): UseCase<UpdateProjectRequest, UpdateProjectResponse> {
    const projectRepository = new PrismaProjectRepository();
    const inner = new UpdateProjectUseCase(projectRepository);
    return new RoleGuardDecorator(["SUPERADMIN", "ADMIN"] as const, inner);
  }
}
