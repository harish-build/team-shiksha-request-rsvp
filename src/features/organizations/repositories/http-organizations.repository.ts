import type { HttpClient } from "@/shared/interfaces/http-client";
import type { OrganizationsRepository } from "../interfaces/organizations.repository";
import type { Organization } from "../types/organization";

interface ListOrganizationsResponseBody {
  organizations: Organization[];
}

export class HttpOrganizationsRepository implements OrganizationsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(): Promise<Organization[]> {
    const response = await this.httpClient.get<ListOrganizationsResponseBody>({
      path: "/api/organizations",
    });
    return response.organizations;
  }
}
