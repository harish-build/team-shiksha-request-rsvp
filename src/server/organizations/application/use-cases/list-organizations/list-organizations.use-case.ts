import { Result } from "@/server/shared/domain/result";
import type { UseCase } from "@/server/shared/domain/use-case";
import type { Organization } from "../../../domain/entities/organization";
import type { OrganizationRepository } from "../../../domain/interfaces/repositories/organization.repository";
import type {
  ListOrganizationsRequest,
  ListOrganizationsResponse,
} from "./list-organizations.types";

export class ListOrganizationsUseCase
  implements UseCase<ListOrganizationsRequest, ListOrganizationsResponse>
{
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(request: ListOrganizationsRequest): Promise<ListOrganizationsResponse> {
    const organizations = await this.loadOrganizationsFor(request);
    return Result.ok({ organizations });
  }

  private async loadOrganizationsFor(
    request: ListOrganizationsRequest
  ): Promise<Organization[]> {
    if (request.actorRole === "SUPERADMIN") {
      return this.organizationRepository.findAll();
    }

    if (!request.actorOrgId) return [];

    const ownOrg = await this.organizationRepository.findById(request.actorOrgId);
    return ownOrg ? [ownOrg] : [];
  }
}
