import type {
  ProjectsRepository,
  UpdateProjectInput,
} from "../../interfaces/projects.repository";
import type { Project } from "../../types/project";

export class UpdateProjectUseCase {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async execute(id: string, patch: UpdateProjectInput): Promise<Project> {
    return this.projectsRepository.update(id, patch);
  }
}
