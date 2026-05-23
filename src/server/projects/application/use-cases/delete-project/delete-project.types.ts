import type { Result } from "@/server/shared/domain/result";
import type { Role } from "@/server/shared/infrastructure/session-data";

export interface DeleteProjectRequest {
  actorRole: Role;
  actorOrgId: string | null;
  projectId: string;
}

export interface DeleteProjectResponseData {
  success: true;
}

export type DeleteProjectResponse = Result<DeleteProjectResponseData, Error>;
