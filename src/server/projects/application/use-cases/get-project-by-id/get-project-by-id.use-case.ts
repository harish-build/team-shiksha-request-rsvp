import { NotFoundError, ValidationError } from "@/server/shared/domain/errors";
import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import type {
  GetProjectByIdRequest,
  GetProjectByIdResponse,
  GetProjectByIdResponseData,
} from "./get-project-by-id.types";

export class GetProjectByIdUseCase
  implements UseCase<GetProjectByIdRequest, GetProjectByIdResponse>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: GetProjectByIdRequest): Promise<GetProjectByIdResponse> {
    if (!request.projectId || request.projectId.trim() === "") {
      return Result.fail<GetProjectByIdResponseData, Error>(
        new ValidationError("projectId is required")
      );
    }

    if (request.actorRole === "MEMBER" && !request.actorProjectIds.includes(request.projectId)) {
      return Result.fail<GetProjectByIdResponseData, Error>(new NotFoundError());
    }

    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      return Result.fail<GetProjectByIdResponseData, Error>(new NotFoundError());
    }

    if (request.actorRole === "ADMIN" && project.orgId !== request.actorOrgId) {
      return Result.fail<GetProjectByIdResponseData, Error>(new NotFoundError());
    }

    return Result.ok<GetProjectByIdResponseData, Error>({ project });
  }
}
