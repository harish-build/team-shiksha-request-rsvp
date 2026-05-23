import type { Project } from "../types/project";

export interface ProjectsRepository {
  list(): Promise<Project[]>;
}
