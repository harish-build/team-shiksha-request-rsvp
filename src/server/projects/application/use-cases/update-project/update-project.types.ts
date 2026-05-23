import type { Result } from "@/server/shared/domain/result";
import type { Role } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../../domain/entities/project";

export interface UpdateProjectRequest {
  actorRole: Role;
  actorOrgId: string | null;
  projectId: string;
  name: string;
}

export interface UpdateProjectResponseData {
  project: Project;
}

export type UpdateProjectResponse = Result<UpdateProjectResponseData, Error>;
