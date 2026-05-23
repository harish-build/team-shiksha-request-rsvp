import type { Result } from "@/server/shared/domain/result";
import type { Role } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../../domain/entities/project";

export interface GetProjectByIdRequest {
  actorRole: Role;
  actorOrgId: string | null;
  actorProjectIds: string[];
  projectId: string;
}

export interface GetProjectByIdResponseData {
  project: Project;
}

export type GetProjectByIdResponse = Result<GetProjectByIdResponseData, Error>;
