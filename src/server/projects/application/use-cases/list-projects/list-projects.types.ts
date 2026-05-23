import type { Result } from "@/server/shared/domain/result";
import type { Role } from "@/server/shared/infrastructure/session-data";
import type { Project } from "../../../domain/entities/project";

export interface ListProjectsRequest {
  actorRole: Role;
  actorOrgId: string | null;
  actorProjectIds: string[];
}

export interface ListProjectsResponseData {
  projects: Project[];
}

export type ListProjectsResponse = Result<ListProjectsResponseData, Error>;
