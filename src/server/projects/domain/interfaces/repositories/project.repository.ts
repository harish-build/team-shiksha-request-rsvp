import type { Project } from "../../entities/project";

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findByOrgId(orgId: string): Promise<Project[]>;
  findByIds(ids: string[]): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
}
