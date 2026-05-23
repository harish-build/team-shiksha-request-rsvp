import { PrismaOrganizationRepository } from "../../../infrastructure/repositories/prisma-organization.repository";
import { ListOrganizationsUseCase } from "./list-organizations.use-case";

export class ListOrganizationsUseCaseFactory {
  create(): ListOrganizationsUseCase {
    const organizationRepository = new PrismaOrganizationRepository();
    return new ListOrganizationsUseCase(organizationRepository);
  }
}
