import { z } from "zod";
import { ForbiddenError, ValidationError } from "@/server/shared/domain/errors";
import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  CreateProjectResponseData,
} from "./create-project.types";

const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  orgId: z.string().min(1, "Organization id is required"),
});

export class CreateProjectUseCase
  implements UseCase<CreateProjectRequest, CreateProjectResponse>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    const parsed = createProjectSchema.safeParse({
      name: request.name,
      orgId: request.orgId,
    });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return Result.fail<CreateProjectResponseData, Error>(
        new ValidationError(message)
      );
    }

    if (request.actorRole === "MEMBER") {
      return Result.fail<CreateProjectResponseData, Error>(
        new ForbiddenError("Members cannot create projects")
      );
    }

    if (
      request.actorRole === "ADMIN" &&
      request.actorOrgId !== parsed.data.orgId
    ) {
      return Result.fail<CreateProjectResponseData, Error>(
        new ForbiddenError("Admin cannot create projects in other organizations")
      );
    }

    const project = await this.projectRepository.create({
      name: parsed.data.name,
      orgId: parsed.data.orgId,
    });

    return Result.ok<CreateProjectResponseData, Error>({ project });
  }
}
