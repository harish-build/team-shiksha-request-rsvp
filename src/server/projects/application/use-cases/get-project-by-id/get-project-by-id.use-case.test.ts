import { NotFoundError, ValidationError } from "@/server/shared/domain/errors";
import type { Project } from "../../../domain/entities/project";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import { GetProjectByIdUseCase } from "./get-project-by-id.use-case";

describe("GetProjectByIdUseCase", () => {
  let projectRepository: jest.Mocked<ProjectRepository>;
  let useCase: GetProjectByIdUseCase;

  const projectInOrgA: Project = { id: "proj-1", name: "Alpha", orgId: "org-a" };
  const projectInOrgB: Project = { id: "proj-9", name: "Zeta", orgId: "org-b" };

  beforeEach(() => {
    projectRepository = {
      findAll: jest.fn(),
      findByOrgId: jest.fn(),
      findByIds: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetProjectByIdUseCase(projectRepository);
  });

  it("returns the project when actor is SUPERADMIN", async () => {
    projectRepository.findById.mockResolvedValue(projectInOrgB);

    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      actorProjectIds: [],
      projectId: "proj-9",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().project).toEqual(projectInOrgB);
  });

  it("returns the project when actor is ADMIN and project is in their org", async () => {
    projectRepository.findById.mockResolvedValue(projectInOrgA);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      actorProjectIds: [],
      projectId: "proj-1",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().project).toEqual(projectInOrgA);
  });

  it("returns NotFoundError when ADMIN requests a project in a different org", async () => {
    projectRepository.findById.mockResolvedValue(projectInOrgB);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      actorProjectIds: [],
      projectId: "proj-9",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(NotFoundError);
  });

  it("returns the project when MEMBER is a member of it", async () => {
    projectRepository.findById.mockResolvedValue(projectInOrgA);

    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
      actorProjectIds: ["proj-1"],
      projectId: "proj-1",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().project).toEqual(projectInOrgA);
  });

  it("returns NotFoundError when MEMBER requests a project they don't belong to without hitting the repo", async () => {
    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
      actorProjectIds: ["proj-2"],
      projectId: "proj-1",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(NotFoundError);
    expect(projectRepository.findById).not.toHaveBeenCalled();
  });

  it("returns NotFoundError when project does not exist (SUPERADMIN)", async () => {
    projectRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      actorProjectIds: [],
      projectId: "ghost",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(NotFoundError);
  });

  it("returns ValidationError when projectId is empty", async () => {
    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      actorProjectIds: [],
      projectId: "",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(projectRepository.findById).not.toHaveBeenCalled();
  });
});
