import type { ProjectsRepository } from "../../interfaces/projects.repository";

export class DeleteProjectUseCase {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async execute(id: string): Promise<void> {
    return this.projectsRepository.delete(id);
  }
}
