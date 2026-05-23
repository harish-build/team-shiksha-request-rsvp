import type { OrganizationsRepository } from "../../interfaces/organizations.repository";
import type { Organization } from "../../types/organization";

export class ListOrganizationsUseCase {
  constructor(private readonly organizationsRepository: OrganizationsRepository) {}

  async execute(): Promise<Organization[]> {
    return this.organizationsRepository.list();
  }
}
