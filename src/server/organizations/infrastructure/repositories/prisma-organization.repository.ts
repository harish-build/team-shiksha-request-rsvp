import { prisma } from "@/server/shared/infrastructure/prisma.client";
import type { Organization } from "../../domain/entities/organization";
import type { OrganizationRepository } from "../../domain/interfaces/repositories/organization.repository";

const organizationSelect = { id: true, name: true } as const;

export class PrismaOrganizationRepository implements OrganizationRepository {
  async findAll(): Promise<Organization[]> {
    return prisma.organization.findMany({
      select: organizationSelect,
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
      select: organizationSelect,
    });
  }
}
