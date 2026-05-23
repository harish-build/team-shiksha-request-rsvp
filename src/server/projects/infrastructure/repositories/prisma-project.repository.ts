import { prisma } from "@/server/shared/infrastructure/prisma.client";
import type { Project } from "../../domain/entities/project";
import type { ProjectRepository } from "../../domain/interfaces/repositories/project.repository";

const projectSelect = { id: true, name: true, orgId: true } as const;

export class PrismaProjectRepository implements ProjectRepository {
  async findAll(): Promise<Project[]> {
    return prisma.project.findMany({ select: projectSelect });
  }

  async findByOrgId(orgId: string): Promise<Project[]> {
    return prisma.project.findMany({ where: { orgId }, select: projectSelect });
  }

  async findByIds(ids: string[]): Promise<Project[]> {
    if (ids.length === 0) return [];
    return prisma.project.findMany({
      where: { id: { in: ids } },
      select: projectSelect,
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      select: projectSelect,
    });
  }
}
