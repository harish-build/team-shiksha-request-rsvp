import type { Organization } from "../../../domain/entities/organization";
import type { OrganizationRepository } from "../../../domain/interfaces/repositories/organization.repository";
import { ListOrganizationsUseCase } from "./list-organizations.use-case";

describe("ListOrganizationsUseCase", () => {
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let useCase: ListOrganizationsUseCase;

  const orgA: Organization = { id: "org-a", name: "Org A" };
  const orgB: Organization = { id: "org-b", name: "Org B" };

  beforeEach(() => {
    organizationRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new ListOrganizationsUseCase(organizationRepository);
  });

  it("returns every organization when actor is SUPERADMIN", async () => {
    organizationRepository.findAll.mockResolvedValue([orgA, orgB]);

    const result = await useCase.execute({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().organizations).toEqual([orgA, orgB]);
    expect(organizationRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it("returns only the actor's own organization when actor is ADMIN", async () => {
    organizationRepository.findById.mockResolvedValue(orgA);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().organizations).toEqual([orgA]);
    expect(organizationRepository.findById).toHaveBeenCalledWith("org-a");
    expect(organizationRepository.findAll).not.toHaveBeenCalled();
  });

  it("returns only the actor's own organization when actor is MEMBER", async () => {
    organizationRepository.findById.mockResolvedValue(orgA);

    const result = await useCase.execute({
      actorRole: "MEMBER",
      actorOrgId: "org-a",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().organizations).toEqual([orgA]);
    expect(organizationRepository.findById).toHaveBeenCalledWith("org-a");
    expect(organizationRepository.findAll).not.toHaveBeenCalled();
  });

  it("returns an empty list when actor has null orgId (defensive)", async () => {
    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: null,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().organizations).toEqual([]);
    expect(organizationRepository.findById).not.toHaveBeenCalled();
    expect(organizationRepository.findAll).not.toHaveBeenCalled();
  });

  it("returns an empty list when actor's org does not exist (defensive)", async () => {
    organizationRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      actorRole: "ADMIN",
      actorOrgId: "org-missing",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().organizations).toEqual([]);
    expect(organizationRepository.findById).toHaveBeenCalledWith("org-missing");
  });
});
