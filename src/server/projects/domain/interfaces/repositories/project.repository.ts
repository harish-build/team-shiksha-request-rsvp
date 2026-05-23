import type { Project } from "../../entities/project";

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findByOrgId(orgId: string): Promise<Project[]>;
  findByIds(ids: string[]): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  create(input: { name: string; orgId: string }): Promise<Project>;
  update(id: string, patch: { name: string }): Promise<Project>;
  delete(id: string): Promise<void>;
}
