import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateProjectForm } from "./CreateProjectForm";
import type { Role } from "@/features/auth/types/actor";
import type { Organization } from "@/features/organizations/types/organization";

class CreateProjectFormPage {
  get nameField() {
    return screen.getByLabelText(/name/i);
  }
  queryOrgSelect() {
    return screen.queryByLabelText(/organization/i) as HTMLSelectElement | null;
  }
  get submitButton() {
    return screen.getByRole("button", { name: /create project|creating/i });
  }
  isSubmitDisabled(): boolean {
    return this.submitButton.hasAttribute("disabled");
  }
  shouldShowOrgLoading() {
    expect(screen.getByText(/loading organizations/i)).toBeInTheDocument();
  }
}

describe("Component Test: CreateProjectForm", () => {
  const renderComponent = (props: {
    actorRole: Role;
    actorOrgId: string | null;
    isLoading?: boolean;
    error?: string | null;
    onSubmit?: jest.Mock;
    organizations?: Organization[];
    isLoadingOrgs?: boolean;
  }) => {
    const onSubmit = props.onSubmit ?? jest.fn().mockResolvedValue(undefined);
    render(
      <CreateProjectForm
        actorRole={props.actorRole}
        actorOrgId={props.actorOrgId}
        isLoading={props.isLoading ?? false}
        error={props.error ?? null}
        onSubmit={onSubmit}
        organizations={props.organizations}
        isLoadingOrgs={props.isLoadingOrgs}
      />
    );
    return { page: new CreateProjectFormPage(), onSubmit, user: userEvent.setup() };
  };

  it("submits with name and the admin's orgId when admin role", async () => {
    const { page, onSubmit, user } = renderComponent({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
    });

    expect(page.queryOrgSelect()).toBeNull();

    await user.type(page.nameField, "New Initiative");
    await user.click(page.submitButton);

    expect(onSubmit).toHaveBeenCalledWith({ name: "New Initiative", orgId: "org-a" });
  });

  it("submits with the selected org when superadmin role", async () => {
    const organizations: Organization[] = [
      { id: "org-a", name: "Org A" },
      { id: "org-b", name: "Org B" },
    ];
    const { page, onSubmit, user } = renderComponent({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      organizations,
    });

    const orgSelect = page.queryOrgSelect();
    expect(orgSelect).not.toBeNull();

    await user.type(page.nameField, "Cross-Org Project");
    await user.selectOptions(orgSelect!, "org-b");
    await user.click(page.submitButton);

    expect(onSubmit).toHaveBeenCalledWith({ name: "Cross-Org Project", orgId: "org-b" });
  });

  it("disables submit while loading", () => {
    const { page } = renderComponent({
      actorRole: "ADMIN",
      actorOrgId: "org-a",
      isLoading: true,
    });

    expect(page.isSubmitDisabled()).toBe(true);
  });

  it("shows a loading state when organizations are still loading for a superadmin", () => {
    const { page } = renderComponent({
      actorRole: "SUPERADMIN",
      actorOrgId: null,
      organizations: [],
      isLoadingOrgs: true,
    });

    page.shouldShowOrgLoading();
    expect(page.isSubmitDisabled()).toBe(true);
    expect(page.queryOrgSelect()).toBeNull();
  });
});
