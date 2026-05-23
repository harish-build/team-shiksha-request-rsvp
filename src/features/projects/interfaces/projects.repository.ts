import type { Project } from "../types/project";

export interface ProjectsRepository {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
}
