import type { CreateProjectInput, ProjectsRepository } from "../../interfaces/projects.repository";
import type { Project } from "../../types/project";

export class CreateProjectUseCase {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    return this.projectsRepository.create(input);
  }
}
