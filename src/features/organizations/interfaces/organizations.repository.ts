import type { Organization } from "../types/organization";

export interface OrganizationsRepository {
  list(): Promise<Organization[]>;
}
