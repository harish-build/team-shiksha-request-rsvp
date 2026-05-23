import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/shared/domain/errors";
import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import type {
  DeleteProjectRequest,
  DeleteProjectResponse,
  DeleteProjectResponseData,
} from "./delete-project.types";

export class DeleteProjectUseCase
  implements UseCase<DeleteProjectRequest, DeleteProjectResponse>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: DeleteProjectRequest): Promise<DeleteProjectResponse> {
    if (!request.projectId || request.projectId.trim() === "") {
      return Result.fail<DeleteProjectResponseData, Error>(
        new ValidationError("projectId is required")
      );
    }

    if (request.actorRole === "MEMBER") {
      return Result.fail<DeleteProjectResponseData, Error>(
        new ForbiddenError("Members cannot delete projects")
      );
    }

    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      return Result.fail<DeleteProjectResponseData, Error>(new NotFoundError());
    }

    if (request.actorRole === "ADMIN" && project.orgId !== request.actorOrgId) {
      return Result.fail<DeleteProjectResponseData, Error>(new NotFoundError());
    }

    await this.projectRepository.delete(request.projectId);
    return Result.ok<DeleteProjectResponseData, Error>({ success: true });
  }
}
