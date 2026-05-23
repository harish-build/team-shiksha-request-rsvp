import { ForbiddenError, ValidationError } from "@/server/shared/domain/errors";
import type { Project } from "../../../domain/entities/project";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import { CreateProjectUseCase } from "./create-project.use-case";

describe("CreateProjectUseCase", () => {
  let projectRepository: jest.Mocked<ProjectRepository>;
  let useCase: CreateProjectUseCase;

  const createdProject: Project = {
    id: "proj-new",
    name: "New Project",
    orgId: "org-a",
  };

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
    useCase = new CreateProjectUseCase(projectRepository);
  });

  it("creates a project when actor is SUPERADMIN in any org", async () => {
    projectRepository.create.mockResolvedValue(createdProject);

    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      name: "New Project",
      orgId: "org-a",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().project).toEqual(createdProject);
    expect(projectRepository.create).toHaveBeenCalledWith({
      name: "New Project",
      orgId: "org-a",
    });
  });

  it("creates a project when actor is ADMIN in their own org", async () => {
    projectRepository.create.mockResolvedValue(createdProject);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      name: "New Project",
      orgId: "org-a",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().project).toEqual(createdProject);
  });

  it("returns ForbiddenError when ADMIN tries to create in a different org without hitting the repo", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      name: "New Project",
      orgId: "org-b",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ForbiddenError);
    expect(projectRepository.create).not.toHaveBeenCalled();
  });

  it("returns ValidationError when name is empty", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      name: "",
      orgId: "org-a",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(projectRepository.create).not.toHaveBeenCalled();
  });

  it("returns ValidationError when name is whitespace only", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      name: "   ",
      orgId: "org-a",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(projectRepository.create).not.toHaveBeenCalled();
  });

  it("returns ValidationError when orgId is empty", async () => {
    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      name: "New Project",
      orgId: "",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(projectRepository.create).not.toHaveBeenCalled();
  });

  it("returns ForbiddenError when actorRole is MEMBER (defensive — should not normally reach here)", async () => {
    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
      name: "New Project",
      orgId: "org-a",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ForbiddenError);
    expect(projectRepository.create).not.toHaveBeenCalled();
  });
});
