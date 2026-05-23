import { RoleGuardDecorator } from "@/server/shared/decorators/role-guard.decorator";
import type { UseCase } from "@/server/shared/domain/use-case";
import { PrismaProjectRepository } from "../../../infrastructure/repositories/prisma-project.repository";
import { DeleteProjectUseCase } from "./delete-project.use-case";
import type {
  DeleteProjectRequest,
  DeleteProjectResponse,
} from "./delete-project.types";

export class DeleteProjectUseCaseFactory {
  create(): UseCase<DeleteProjectRequest, DeleteProjectResponse> {
    const projectRepository = new PrismaProjectRepository();
    const inner = new DeleteProjectUseCase(projectRepository);
    return new RoleGuardDecorator(["SUPERADMIN", "ADMIN"] as const, inner);
  }
}
