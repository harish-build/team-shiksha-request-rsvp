import { z } from "zod";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/shared/domain/errors";
import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import type {
  UpdateProjectRequest,
  UpdateProjectResponse,
  UpdateProjectResponseData,
} from "./update-project.types";

const nameSchema = z.string().trim().min(1, "Project name is required");

export class UpdateProjectUseCase
  implements UseCase<UpdateProjectRequest, UpdateProjectResponse>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    const parsedName = nameSchema.safeParse(request.name);
    if (!parsedName.success) {
      const message = parsedName.error.issues[0]?.message ?? "Invalid name";
      return Result.fail<UpdateProjectResponseData, Error>(
        new ValidationError(message)
      );
    }

    if (!request.projectId || request.projectId.trim() === "") {
      return Result.fail<UpdateProjectResponseData, Error>(
        new ValidationError("projectId is required")
      );
    }

    if (request.actorRole === "MEMBER") {
      return Result.fail<UpdateProjectResponseData, Error>(
        new ForbiddenError("Members cannot update projects")
      );
    }

    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      return Result.fail<UpdateProjectResponseData, Error>(new NotFoundError());
    }

    if (request.actorRole === "ADMIN" && project.orgId !== request.actorOrgId) {
      return Result.fail<UpdateProjectResponseData, Error>(new NotFoundError());
    }

    const updated = await this.projectRepository.update(request.projectId, {
      name: parsedName.data,
    });
    return Result.ok<UpdateProjectResponseData, Error>({ project: updated });
  }
}
