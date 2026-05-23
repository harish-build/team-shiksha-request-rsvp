import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { Project } from "../../../domain/entities/project";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import type {
  ListProjectsRequest,
  ListProjectsResponse,
} from "./list-projects.types";

export class ListProjectsUseCase
  implements UseCase<ListProjectsRequest, ListProjectsResponse>
{
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(request: ListProjectsRequest): Promise<ListProjectsResponse> {
    const projects = await this.loadProjectsFor(request);
    return Result.ok({ projects });
  }

  private async loadProjectsFor(request: ListProjectsRequest): Promise<Project[]> {
    if (request.actorRole === "SUPERADMIN") {
      return this.projectRepository.findAll();
    }

    if (request.actorRole === "ADMIN") {
      if (!request.actorOrgId) return [];
      return this.projectRepository.findByOrgId(request.actorOrgId);
    }

    if (request.actorProjectIds.length === 0) return [];
    return this.projectRepository.findByIds(request.actorProjectIds);
  }
}
