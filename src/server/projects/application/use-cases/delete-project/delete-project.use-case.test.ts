import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/server/shared/domain/errors";
import type { Project } from "../../../domain/entities/project";
import type { ProjectRepository } from "../../../domain/interfaces/repositories/project.repository";
import { DeleteProjectUseCase } from "./delete-project.use-case";

describe("DeleteProjectUseCase", () => {
  let projectRepository: jest.Mocked<ProjectRepository>;
  let useCase: DeleteProjectUseCase;

  const existing: Project = { id: "proj-1", name: "Alpha", orgId: "org-a" };

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
    useCase = new DeleteProjectUseCase(projectRepository);
  });

  it("deletes the project when actor is SUPERADMIN", async () => {
    projectRepository.findById.mockResolvedValue(existing);
    projectRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      projectId: "proj-1",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().success).toBe(true);
    expect(projectRepository.delete).toHaveBeenCalledWith("proj-1");
  });

  it("deletes the project when actor is ADMIN in their own org", async () => {
    projectRepository.findById.mockResolvedValue(existing);
    projectRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "proj-1",
    });

    expect(result.isSuccess).toBe(true);
    expect(projectRepository.delete).toHaveBeenCalledWith("proj-1");
  });

  it("returns NotFoundError when ADMIN deletes a project in a different org", async () => {
    projectRepository.findById.mockResolvedValue({ ...existing, orgId: "org-b" });

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "proj-1",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(NotFoundError);
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it("returns NotFoundError when project does not exist", async () => {
    projectRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "missing",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(NotFoundError);
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it("returns ValidationError when projectId is empty", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      projectId: "",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ValidationError);
    expect(projectRepository.findById).not.toHaveBeenCalled();
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it("returns ForbiddenError when actor is MEMBER (defensive)", async () => {
    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
      projectId: "proj-1",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error()).toBeInstanceOf(ForbiddenError);
    expect(projectRepository.findById).not.toHaveBeenCalled();
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });
});
