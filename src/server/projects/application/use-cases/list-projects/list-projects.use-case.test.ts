import type { Project } from "../../../domain/entities/project";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import { ListProjectsUseCase } from "./list-projects.use-case";

describe("ListProjectsUseCase", () => {
  let projectRepository: jest.Mocked<ProjectRepository>;
  let useCase: ListProjectsUseCase;

  const allProjects: Project[] = [
    { id: "proj-1", name: "Alpha", orgId: "org-a" },
    { id: "proj-2", name: "Beta", orgId: "org-a" },
    { id: "proj-3", name: "Gamma", orgId: "org-b" },
  ];

  beforeEach(() => {
    projectRepository = {
      findAll: jest.fn(),
      findByOrgId: jest.fn(),
      findByIds: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new ListProjectsUseCase(projectRepository);
  });

  it("returns every project when actor is SUPERADMIN", async () => {
    projectRepository.findAll.mockResolvedValue(allProjects);

    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      actorProjectIds: [],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().projects).toEqual(allProjects);
    expect(projectRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("returns only the actor's org projects when actor is ADMIN", async () => {
    const orgProjects = allProjects.filter((p) => p.orgId === "org-a");
    projectRepository.findByOrgId.mockResolvedValue(orgProjects);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      actorProjectIds: [],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().projects).toEqual(orgProjects);
    expect(projectRepository.findByOrgId).toHaveBeenCalledWith("org-a");
  });

  it("returns only the actor's memberships when actor is MEMBER", async () => {
    const memberProjects = [allProjects[0], allProjects[2]];
    projectRepository.findByIds.mockResolvedValue(memberProjects);

    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
      actorProjectIds: ["proj-1", "proj-3"],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().projects).toEqual(memberProjects);
    expect(projectRepository.findByIds).toHaveBeenCalledWith(["proj-1", "proj-3"]);
  });

  it("returns an empty list for a MEMBER with no memberships without hitting the repository", async () => {
    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
      actorProjectIds: [],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().projects).toEqual([]);
    expect(projectRepository.findByIds).not.toHaveBeenCalled();
  });

  it("returns an empty list for an ADMIN with no orgId without hitting the repository", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: null,
      actorProjectIds: [],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().projects).toEqual([]);
    expect(projectRepository.findByOrgId).not.toHaveBeenCalled();
  });
});
