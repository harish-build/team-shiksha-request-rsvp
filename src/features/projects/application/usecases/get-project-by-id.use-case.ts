import type { ProjectsRepository } from "../../interfaces/projects.repository";
import type { Project } from "../../types/project";

export class GetProjectByIdUseCase {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async execute(id: string): Promise<Project | null> {
    return this.projectsRepository.getById(id);
  }
}
