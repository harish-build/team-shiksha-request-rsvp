import type { Organization } from "../../entities/organization";

export interface OrganizationRepository {
  findAll(): Promise<Organization[]>;
  findById(id: string): Promise<Organization | null>;
}
