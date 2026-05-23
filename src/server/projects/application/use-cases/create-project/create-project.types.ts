import type { Result } from "@/server/shared/domain/result";
import type { Role } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../../domain/entities/project";

export interface CreateProjectRequest {
  actorRole: Role;
  actorOrgId: string | null;
  name: string;
  orgId: string;
}

export interface CreateProjectResponseData {
  project: Project;
}

export type CreateProjectResponse = Result<CreateProjectResponseData, Error>;
