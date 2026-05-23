import type { Result } from "@/server/shared/domain/result";
import type { Role } from "@/server/shared/infrastructure/session-data";
import type { Organization } from "../../../domain/entities/organization";

export interface ListOrganizationsRequest {
  actorRole: Role;
  actorOrgId: string | null;
}

export interface ListOrganizationsResponseData {
  organizations: Organization[];
}

export type ListOrganizationsResponse = Result<ListOrganizationsResponseData, Error>;
