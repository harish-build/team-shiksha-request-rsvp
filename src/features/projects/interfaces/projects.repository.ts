import type { Project } from "../types/project";

export interface CreateProjectInput {
  name: string;
  orgId: string;
}

export interface UpdateProjectInput {
  name: string;
}

export interface ProjectsRepository {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | null>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, patch: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
}
