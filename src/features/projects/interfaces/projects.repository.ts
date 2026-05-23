import type { Project } from "../types/project";

export interface CreateProjectInput {
  name: string;
  orgId: string;
}

export interface ProjectsRepository {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(input: CreateProjectInput): Promise<Project>;
}
