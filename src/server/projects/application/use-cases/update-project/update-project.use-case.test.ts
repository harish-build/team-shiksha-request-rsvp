import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/shared/domain/errors";
import type { Project } from "../../../domain/entities/project";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import { UpdateProjectUseCase } from "./update-project.use-case";

describe("UpdateProjectUseCase", () => {
  let projectRepository: jest.Mocked<ProjectRepository>;
  let useCase: UpdateProjectUseCase;

  const existing: Project = { id: "proj-1", name: "Old", orgId: "org-a" };
  const updated: Project = { id: "proj-1", name: "Renamed", orgId: "org-a" };

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
    useCase = new UpdateProjectUseCase(projectRepository);
  });

  it("updates the project when actor is SUPERADMIN", async () => {
    projectRepository.findById.mockResolvedValue(existing);
    projectRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      projectId: "proj-1",
      name: "Renamed",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().project).toEqual(updated);
    expect(projectRepository.update).toHaveBeenCalledWith("proj-1", { name: "Renamed" });
  });

  it("updates the project when actor is ADMIN in their own org", async () => {
    projectRepository.findById.mockResolvedValue(existing);
    projectRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "proj-1",
      name: "Renamed",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().project).toEqual(updated);
  });

  it("returns NotFoundError when ADMIN updates a project in a different org", async () => {
    projectRepository.findById.mockResolvedValue({ ...existing, orgId: "org-b" });

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "proj-1",
      name: "Renamed",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(NotFoundError);
    expect(projectRepository.update).not.toHaveBeenCalled();
  });

  it("returns NotFoundError when project does not exist", async () => {
    projectRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "missing",
      name: "Renamed",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(NotFoundError);
    expect(projectRepository.update).not.toHaveBeenCalled();
  });

  it("returns ValidationError when name is empty", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "proj-1",
      name: "",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(projectRepository.findById).not.toHaveBeenCalled();
    expect(projectRepository.update).not.toHaveBeenCalled();
  });

  it("returns ValidationError when projectId is empty", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "",
      name: "Renamed",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(projectRepository.findById).not.toHaveBeenCalled();
    expect(projectRepository.update).not.toHaveBeenCalled();
  });

  it("returns ForbiddenError when actor is MEMBER (defensive)", async () => {
    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
      projectId: "proj-1",
      name: "Renamed",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ForbiddenError);
    expect(projectRepository.findById).not.toHaveBeenCalled();
    expect(projectRepository.update).not.toHaveBeenCalled();
  });
});
