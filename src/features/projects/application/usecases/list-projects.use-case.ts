import type { ProjectsRepository } from "../../interfaces/projects.repository";
import type { Project } from "../../types/project";

export class ListProjectsUseCase {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async execute(): Promise<Project[]> {
    return this.projectsRepository.list();
  }
}
